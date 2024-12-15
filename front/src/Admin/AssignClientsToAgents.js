import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal"; // Assuming Modal component is already created

const AssignClientsToAgents = () => {
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQueryAgents, setSearchQueryAgents] = useState("");
  const [searchQueryClients, setSearchQueryClients] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showClients, setShowClients] = useState(false);
  const [assignedClients, setAssignedClients] = useState([]);
  const adminId = localStorage.getItem("adminId"); // Get adminId from localStorage

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get(
          `https://trcnfx.com/api/agents-for-admin/${adminId}`
        );
        setAgents(response.data); // Set agents assigned to this admin
        setFilteredAgents(response.data); // Initialize filteredAgents with all agents
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await axios.get("https://trcnfx.com/api/clients");
        setClients(response.data);
        setFilteredClients(response.data); // Initialize filteredClients
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchAgents();
    fetchClients();
  }, []);

  const handleAssignClient = async (clientId) => {
    try {
      await axios.post("https://trcnfx.com/api/assign-client", {
        agentId: selectedAgent._id,
        clientId: clientId,
        agentUID: selectedAgent.agentId, // Include agentUID in the request
      });
      alert("Client assigned successfully.");
      setShowClients(false);
    } catch (error) {
      console.error("Error assigning client:", error);
      alert("Failed to assign client.");
    }
  };

  const handleViewAssignedClients = async (agent) => {
    try {
      const response = await axios.get(
        `https://trcnfx.com/api/assigned-clients/${agent._id}`
      );
      setAssignedClients(response.data);
      setSelectedAgent(agent);
      setShowClients(false); // Hide the assign clients table if it's open
    } catch (error) {
      console.error("Error fetching assigned clients:", error);
      alert("Failed to fetch assigned clients.");
    }
  };

  const handleRemoveClient = async (clientId) => {
    if (window.confirm("Are you sure you want to remove this client?")) {
      try {
        await axios.post("https://trcnfx.com/api/remove-client", {
          agentId: selectedAgent._id,
          clientId: clientId,
        });
        alert("Client removed successfully.");
        setAssignedClients(
          assignedClients.filter((client) => client._id !== clientId)
        );
      } catch (error) {
        console.error("Error removing client:", error);
        alert("Failed to remove client.");
      }
    }
  };

  const handleSearchAgents = () => {
    const filtered = agents.filter((agent) =>
      agent.agentId.toLowerCase().includes(searchQueryAgents.toLowerCase())
    );
    setFilteredAgents(filtered);
  };

  const handleSearchClients = () => {
    const filtered = clients.filter((client) =>
      client.userId.toLowerCase().includes(searchQueryClients.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  return (
    <div className="admin-recharge-status p-4">
      <h2 className="text-2xl font-bold mb-4">Assign Clients to Agents</h2>
      {showClients ? (
        <div className="overflow-x-auto">
          <h3 className="text-xl font-bold mb-4">
            Assign Clients to {selectedAgent.name}
          </h3>

          {/* Search Bar for Clients */}
          <div className="mb-4">
            <div style={{ display: "flex" }}>
              <input
                style={{ width: "500px" }}
                type="text"
                placeholder="Search by Client ID"
                value={searchQueryClients}
                onChange={(e) => setSearchQueryClients(e.target.value)}
                className="border rounded px-4 py-2 mr-2"
              />
              <button
                onClick={handleSearchClients}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Search
              </button>
            </div>
          </div>

          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Client ID</th>
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
                  <td className="py-3 px-6 text-left">{client.userId}</td>
                  <td className="py-3 px-6 text-left">{client.email}</td>
                  <td className="py-3 px-6 text-left">
                    <button
                      className="bg-blue-500 text-white py-1 px-3 rounded"
                      onClick={() => handleAssignClient(client._id)}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="mt-4 bg-gray-500 text-white py-1 px-3 rounded"
            onClick={() => setShowClients(false)}
          >
            Back to Agents
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Search Bar for Agents */}
          <div className="mb-4">
            <div style={{ display: "flex" }}>
              <input
                style={{ width: "500px" }}
                type="text"
                placeholder="Search by Agent ID"
                value={searchQueryAgents}
                onChange={(e) => setSearchQueryAgents(e.target.value)}
                className="border rounded px-4 py-2 mr-2"
              />
              <button
                onClick={handleSearchAgents}
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
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Team</th>
                <th className="py-3 px-6 text-left">Number of Clients</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {filteredAgents.map((agent) => (
                <tr
                  key={agent._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left">{agent.agentId}</td>
                  <td className="py-3 px-6 text-left">{agent.name}</td>
                  <td className="py-3 px-6 text-left">{agent.team}</td>
                  <td className="py-3 px-6 text-left">{agent.noOfClients}</td>
                  <td className="py-3 px-6 text-left flex">
                    <button
                      className="bg-blue-500 text-white py-1 px-3 rounded mr-2"
                      onClick={() => {
                        setSelectedAgent(agent);
                        setShowClients(true);
                      }}
                    >
                      Assign Clients
                    </button>
                    <button
                      className="bg-green-500 text-white py-1 px-3 rounded"
                      onClick={() => handleViewAssignedClients(agent)}
                    >
                      View Assigned Clients
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assignedClients.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <h3 className="text-xl font-bold mb-4">
            Assigned Clients for {selectedAgent.name}
          </h3>
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="w-full bg-gray-200               text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Client ID</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {assignedClients.map((client) => (
                <tr
                  key={client._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left">{client.userId}</td>
                  <td className="py-3 px-6 text-left">{client.email}</td>
                  <td className="py-3 px-6 text-left">
                    <button
                      className="bg-red-500 text-white py-1 px-3 rounded"
                      onClick={() => handleRemoveClient(client._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="mt-4 bg-gray-500 text-white py-1 px-3 rounded"
            onClick={() => setAssignedClients([])}
          >
            Back to Agents
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignClientsToAgents;
