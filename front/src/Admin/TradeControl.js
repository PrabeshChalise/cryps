import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const TradeControl = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [defaultControl, setDefaultControl] = useState(false);
  const [defaultTradeResult, setDefaultTradeResult] = useState(null);
  const [defaultControlMessage, setDefaultControlMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [agentUID, setAgentUID] = useState(""); // New state for agentUID
  const { userId } = useParams();
  const adminId = localStorage.getItem("adminId"); // Assuming adminId is stored in localStorage

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Fetch clients by admin's team
        const response = await axios.get(
          `https://trcnfx.com/api/clients-by-admin/${adminId}`
        );
        const clientsWithActiveTrades = await Promise.all(
          response.data.map(async (client) => {
            const activeTradesResponse = await axios.get(
              `https://trcnfx.com/api/predictions/waiting1?userId=${client._id}`
            );
            return {
              ...client,
              hasActiveTrades: activeTradesResponse.data.length > 0,
            };
          })
        );
        clientsWithActiveTrades.sort(
          (a, b) => b.hasActiveTrades - a.hasActiveTrades
        );
        setClients(clientsWithActiveTrades);
        setFilteredClients(clientsWithActiveTrades);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, [adminId]);

  useEffect(() => {
    if (userId) {
      fetchPredictions(userId);
    } else {
      const savedUserId = localStorage.getItem("selectedUserId");
      if (savedUserId) {
        fetchPredictions(savedUserId);
      }
    }
  }, [userId]);

  const fetchPredictions = async (userId) => {
    try {
      setPredictions([]);
      const waitingResponse = await axios.get(
        `https://trcnfx.com/api/predictions/waiting1?userId=${userId}`
      );
      const allResponse = await axios.get(
        `https://trcnfx.com/api/predictions/user/${userId}`
      );
      const waitingPredictions = waitingResponse.data.map((prediction) => ({
        ...prediction,
        isLive: true,
      }));

      setPredictions(
        [...waitingPredictions, ...allResponse.data].sort(
          (a, b) => new Date(b.predictedAt) - new Date(a.predictedAt)
        )
      );
      setSelectedUserId(userId);
      localStorage.setItem("selectedUserId", userId);

      // Fetch the default trade result
      const defaultResultResponse = await axios.get(
        `https://trcnfx.com/api/users/${userId}/default-trade-result`
      );
      setDefaultTradeResult(defaultResultResponse.data.defaultTradeResult);

      // Fetch the agentUID
      const agentUIDResponse = await axios.get(
        `https://trcnfx.com/api/agent-uid-by-user-id/${userId}`
      );
      setAgentUID(agentUIDResponse.data.agentUID);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  const handleResult = async (id, result) => {
    try {
      await axios.post(
        `https://trcnfx.com/api/prediction/${id}/result`,
        result
      );
      setPredictions((prevPredictions) =>
        prevPredictions.filter((prediction) => prediction._id !== id)
      );
    } catch (error) {
      console.error("Error updating prediction result:", error);
    }
  };

  const handleConfirmAction = (action, prediction) => {
    setConfirmAction(action);
    setSelectedPrediction(prediction);
  };

  const handleCancelAction = () => {
    setConfirmAction(null);
    setSelectedPrediction(null);
  };

  const handleConfirmResult = () => {
    if (selectedPrediction && confirmAction) {
      handleResult(selectedPrediction._id, confirmAction);
    }
    setConfirmAction(null);
    setSelectedPrediction(null);
  };

  const handleDefaultControl = async (result) => {
    try {
      const defaultTradeResultValue = result === "default" ? null : result;

      await axios.post(
        `https://trcnfx.com/api/users/${selectedUserId}/default-trade-result`,
        { defaultTradeResult: defaultTradeResultValue }
      );

      setDefaultControl(false);
      setDefaultControlMessage("");
      setDefaultTradeResult(
        defaultTradeResultValue === null ? "default" : defaultTradeResultValue
      );
      fetchPredictions(selectedUserId);
    } catch (error) {
      console.error("Error updating default trade result:", error);
    }
  };

  const handleSearch = () => {
    const filtered = clients.filter(
      (client) =>
        client.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleBackToUsers = () => {
    setSelectedUserId(null);
    setPredictions([]);
    localStorage.removeItem("selectedUserId");
    setAgentUID(""); // Clear agentUID when going back to users list
  };

  return (
    <div className="admin-trade-control p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Trade Control</h2>
      {selectedUserId ? (
        <div className="overflow-x-auto">
          <div className="mb-4">
            <button
              className="bg-gray-500 text-white py-1 px-3 rounded"
              onClick={() => setDefaultControl(true)}
            >
              Set Default Control
            </button>
            {defaultTradeResult && (
              <span className="ml-4">
                Current default control:{" "}
                <strong style={{ color: "black" }}>
                  {defaultTradeResult.toUpperCase()}
                </strong>
              </span>
            )}
          </div>

          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Agent ID</th>
                <th className="py-3 px-6 text-left">User ID</th>
                <th className="py-3 px-6 text-left">Coin</th>
                <th className="py-3 px-6 text-left">Date and Time</th>
                <th className="py-3 px-6 text-left">Trade Direction</th>
                <th className="py-3 px-6 text-left">Trade Amount</th>
                <th className="py-3 px-6 text-left">Delivery Time</th>
                <th className="py-3 px-6 text-left">Profit</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {predictions.map((prediction) => (
                <tr
                  key={prediction._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left">
                    {agentUID || "Not assigned"}
                  </td>

                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {prediction.uid}
                  </td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {prediction.symbol.toUpperCase()}/USDT
                  </td>
                  <td className="py-3 px-6 text-left">
                    {new Date(prediction.predictedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {prediction.direction}
                  </td>
                  <td className="py-3 px-6 text-left">{prediction.amount}</td>
                  <td className="py-3 px-6 text-left">
                    {prediction.deliveryTime}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {prediction.result
                      ? `$ ${prediction.result.profit}`
                      : "N/A"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {prediction.isLive ? (
                      <>
                        <button
                          className="bg-green-500 text-white py-1 px-3 rounded mr-2"
                          onClick={() =>
                            handleConfirmAction(
                              {
                                success: true,
                                amount: prediction.amount,
                                message: "Admin approved profit",
                              },
                              prediction
                            )
                          }
                        >
                          Win
                        </button>
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded mr-2"
                          onClick={() =>
                            handleConfirmAction(
                              {
                                success: false,
                                amount: prediction.amount,
                                message: "Admin approved loss",
                              },
                              prediction
                            )
                          }
                        >
                          Loss
                        </button>
                        <button
                          className="bg-gray-500 text-white py-1 px-3 rounded"
                          onClick={() =>
                            handleConfirmAction({ success: null }, prediction)
                          }
                        >
                          Default
                        </button>
                      </>
                    ) : (
                      <span className="text-green-500">&#x25cf;</span> // Display green dot for live trades
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="mt-4 bg-gray-500 text-white py-1 px-3 rounded"
            onClick={handleBackToUsers}
          >
            Back to Users
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="mb-4">
            <div style={{ display: "flex" }}>
              <input
                style={{ width: "500px" }}
                type="text"
                placeholder="Search by User ID or Email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded px-4 py-2 mr-2"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Search
              </button>
            </div>
          </div>
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Agent ID</th>
                <th className="py-3 px-6 text-left">User ID</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {filteredClients.map((client) => (
                <tr
                  key={client._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left">{client.agentUID}</td>
                  <td className="py-3 px-6 text-left">{client.userId}</td>
                  <td className="py-3 px-6 text-left">{client.email}</td>
                  <td className="py-3 px-6 text-left">
                    {client.hasActiveTrades && (
                      <span className="text-green-500">&#x25cf; Active</span> // Green dot for active trades
                    )}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <button
                      className="bg-blue-500 text-white py-1 px-3 rounded"
                      onClick={() => fetchPredictions(client._id)}
                    >
                      Trade Control
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmAction && selectedPrediction && (
        <Modal
          show={true}
          onClose={handleCancelAction}
          onConfirm={handleConfirmResult}
          message={`Are you sure you want to ${
            confirmAction.success === true
              ? "win"
              : confirmAction.success === false
              ? "lose"
              : "keep the default"
          } this trade?`}
        />
      )}

      {defaultControl && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl mb-4">Set Default Control</h3>
            <p>Set default control to win, loss, or default for the user?</p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-green-500 text-white py-1 px-3 rounded mr-2"
                onClick={() => setDefaultControlMessage("win")}
              >
                Win
              </button>
              <button
                className="bg-red-500 text-white py-1 px-3 rounded"
                onClick={() => setDefaultControlMessage("loss")}
              >
                Loss
              </button>
              <button
                className="bg-gray-500 text-white py-1 px-3 rounded ml-2"
                onClick={() => setDefaultControlMessage("default")}
              >
                Default
              </button>
              <button
                className="ml-2 bg-gray-500 text-white py-1 px-3 rounded"
                onClick={() => setDefaultControl(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {defaultControlMessage && (
        <Modal
          show={true}
          onClose={() => setDefaultControlMessage("")}
          onConfirm={() => handleDefaultControl(defaultControlMessage)}
          message={`Are you sure you want to set the default value as ${defaultControlMessage}?`}
        />
      )}
    </div>
  );
};

const Modal = ({ show, onClose, onConfirm, message, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl mb-4">{message}</h3>
        <div className="flex justify-end">
          {children}
          <button
            className="bg-blue-500 text-white py-1 px-3 rounded mr-2"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="bg-gray-500 text-white py-1 px-3 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeControl;
