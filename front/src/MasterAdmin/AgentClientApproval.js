import React, { useEffect, useState } from "react";
import axios from "axios";

const AgentClientApproval = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          "https://trcnxf.com/api/client-requests"
        );
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (id, clientId) => {
    try {
      // Fetch the full client ID
      const clientResponse = await axios.get(
        `https://trcnxf.com/api/user-by-short-id/${clientId}`
      );

      // Check if the response has a valid `_id` in the correct format
      const fullClientId = clientResponse.data._id;

      // Proceed with the approval using the full client ID
      await axios.post(`https://trcnxf.com/api/client-requests/${id}/approve`, {
        clientId: fullClientId, // Now in correct ObjectId format
      });
      setRequests(requests.filter((request) => request._id !== id));
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.post(`https://trcnxf.com/api/client-requests/${id}/decline`);
      setRequests(requests.filter((request) => request._id !== id));
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Agent-Client Approval</h2>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-2">Agent ID</th>
            <th className="py-2">Client ID</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request._id}>
              <td className="border px-4 py-2">
                {request.agentId ? request.agentId.agentId : "N/A"}
              </td>
              <td className="border px-4 py-2">{request.clientId}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleApprove(request._id, request.clientId)}
                  className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecline(request._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Decline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgentClientApproval;
