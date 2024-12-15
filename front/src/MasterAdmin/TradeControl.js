import React, { useEffect, useState } from "react";
import axios from "axios";

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
  const [agents, setAgents] = useState([]);

  // useEffect(() => {
  //   const fetchClients = async () => {
  //     try {
  //       const response = await axios.get("https://trcnxf.com/api/clients");
  //       setClients(response.data);
  //       setFilteredClients(response.data); // Initialize filteredClients
  //     } catch (error) {
  //       console.error("Error fetching clients:", error);
  //     }
  //   };
  //   fetchClients();
  // }, []);
  useEffect(() => {
    const fetchClientsAndAgents = async () => {
      try {
        const clientResponse = await axios.get(
          "https://trcnxf.com/api/clients"
        );
        const agentResponse = await axios.get("https://trcnxf.com/api/agents");
        setClients(clientResponse.data);
        setAgents(agentResponse.data);
        setFilteredClients(clientResponse.data);
      } catch (error) {
        console.error("Error fetching clients or agents:", error);
      }
    };
    fetchClientsAndAgents();
  }, []);
  const getAgentName = (agentUID) => {
    const agent = agents.find((a) => a.agentId === agentUID);
    return agent ? agent.name : "N/A";
  };

  useEffect(() => {
    const savedUserId = localStorage.getItem("selectedUserId");
    if (savedUserId) {
      fetchPredictions(savedUserId);
    }
  }, []);

  const fetchPredictions = async (userId) => {
    try {
      // Clear previous predictions
      setPredictions([]);

      const waitingResponse = await axios.get(
        `https://trcnxf.com/api/predictions/waiting1?userId=${userId}`
      );
      const allResponse = await axios.get(
        `https://trcnxf.com/api/predictions/user/${userId}`
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
        `https://trcnxf.com/api/users/${userId}/default-trade-result`
      );
      setDefaultTradeResult(defaultResultResponse.data.defaultTradeResult);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  const handleResult = async (id, result) => {
    try {
      await axios.post(
        `https://trcnxf.com/api/prediction/${id}/result`,
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
      await axios.post(
        `https://trcnxf.com/api/users/${selectedUserId}/default-trade-result`,
        { defaultTradeResult: result }
      );
      setDefaultControl(false);
      setDefaultControlMessage("");
      setDefaultTradeResult(result);
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
    setPredictions([]); // Clear predictions when going back to the user list
    localStorage.removeItem("selectedUserId"); // Clear the localStorage when navigating back to the users list
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
                      <span className="text-green-500">&#x25cf;</span>
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
                <th className="py-3 px-6 text-left">Agent Name</th>

                <th className="py-3 px-6 text-left">User ID</th>
                <th className="py-3 px-6 text-left">Email</th>
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
                  <td className="py-3 px-6 text-left">
                    {getAgentName(client.agentUID)}
                  </td>

                  <td className="py-3 px-6 text-left">{client.userId}</td>
                  <td className="py-3 px-6 text-left">{client.email}</td>
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
            <p>Set default control to win or loss for user?</p>
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
          message={`Are you sure you want to set default value as ${defaultControlMessage}?`}
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
