import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate

const RechargeStatus = () => {
  const { userId } = useParams(); // Get the userId from the URL parameters
  const navigate = useNavigate(); // Initialize navigate
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]); // State for filtered clients
  const [deposits, setDeposits] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [agentUID, setAgentUID] = useState(""); // Add this line

  const adminId = localStorage.getItem("adminId"); // Assuming adminId is stored in localStorage

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Fetch clients associated with the agents in the logged-in admin's team
        const response = await axios.get(
          `https://trcnfx.com/api/clients-by-admin/${adminId}`
        );
        setClients(response.data);
        setFilteredClients(response.data); // Initialize filteredClients
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    if (adminId) {
      fetchClients();
    }
  }, [adminId]);

  useEffect(() => {
    if (userId) {
      fetchDeposits(userId); // Fetch deposits when the component mounts if userId is present
    }
  }, [userId]);

  const fetchDeposits = async (userId) => {
    try {
      const response = await axios.get(
        `https://trcnfx.com/api/transactions/${userId}`
      );
      const userResponse = await axios.get(
        `https://trcnfx.com/api/agent-uid-by-user-id/${userId}`
      );
      setDeposits(response.data.deposits);
      setSelectedUserId(userId);
      setAgentUID(userResponse.data.agentUID); // Store the agentUID in state
    } catch (error) {
      console.error("Error fetching deposits:", error);
    }
  };

  const handleSearch = () => {
    const filtered = clients.filter((client) =>
      client.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleViewRechargeStatus = (userId) => {
    navigate(`/nimda21/recharge-status/${userId}`); // Redirect to the user's recharge status page
  };

  const handleDeleteDeposit = async (depositId) => {
    if (window.confirm("Are you sure you want to delete this deposit?")) {
      try {
        await axios.delete(`https://trcnfx.com/api/deposits/${depositId}`);
        alert("Deposit deleted successfully");
        setDeposits(deposits.filter((deposit) => deposit._id !== depositId));
      } catch (error) {
        console.error("Error deleting deposit:", error);
        alert("Failed to delete deposit");
      }
    }
  };

  return (
    <div className="admin-recharge-status p-4">
      <h2 className="text-2xl font-bold mb-4">
        {userId ? `Recharge Status for User` : "Recharge Status"}
      </h2>
      {!userId ? (
        <div className="overflow-x-auto">
          <div className="mb-4">
            <div style={{ display: "flex" }}>
              <input
                style={{ width: "500px" }}
                type="text"
                placeholder="Search by User ID"
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
                    <button
                      className="bg-blue-500 text-white py-1 px-3 rounded"
                      onClick={() => handleViewRechargeStatus(client._id)}
                    >
                      View Recharge Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Agent ID</th>

                <th className="py-3 px-6 text-left">User ID</th>
                <th className="py-3 px-6 text-left">Amount</th>
                <th className="py-3 px-6 text-left">Coin</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Proof</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {deposits.map((deposit) => (
                <tr
                  key={deposit._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left">
                    {agentUID || "Not assigned"}
                  </td>{" "}
                  {/* Add this line */}
                  <td className="py-3 px-6 text-left">{deposit.uid}</td>
                  <td className="py-3 px-6 text-left">
                    <b style={{ color: "black", fontWeight: "700" }}>
                      {deposit.amount}
                    </b>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {deposit.selectedSymbol}
                  </td>
                  <td className="py-3 px-6 text-left">{deposit.status}</td>
                  <td className="py-3 px-6 text-left">
                    <a
                      href={deposit.proof}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Proof
                    </a>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {new Date(deposit.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <button
                      className="bg-red-500 text-white py-1 px-3 rounded"
                      onClick={() => handleDeleteDeposit(deposit._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="mt-4 bg-gray-500 text-white py-1 px-3 rounded"
            onClick={() => navigate("/nimda21/recharge-status")}
          >
            Back to Users
          </button>
        </div>
      )}
    </div>
  );
};

export default RechargeStatus;
