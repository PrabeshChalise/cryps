import React, { useEffect, useState } from "react";
import axios from "axios";

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]); // For filtering based on search
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [admin, setAdmin] = useState(null); // Store the logged-in admin data

  useEffect(() => {
    // Fetch the logged-in admin data using adminId from localStorage
    const fetchAdminData = async () => {
      try {
        const adminId = localStorage.getItem("adminId"); // Retrieve adminId from localStorage
        if (!adminId) {
          console.error("Admin not logged in");
          return;
        }

        // Fetch the admin data based on adminId
        const adminResponse = await axios.get(
          `https://trcnfx.com/api/admin/agents/${adminId}` // Replace with your actual endpoint
        );
        setAdmin(adminResponse.data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    // Fetch agents and filter by the logged-in admin's team
    const fetchAgents = async () => {
      try {
        const response = await axios.get("https://trcnfx.com/api/agents");
        const agents = response.data;

        // After fetching admin data, filter agents based on the team
        if (admin) {
          const teamAgents = agents.filter(
            (agent) => agent.team === admin.name // Match agent team with admin name
          );
          setAgents(teamAgents);
          setFilteredAgents(teamAgents); // Initialize filteredAgents with teamAgents
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    // Fetch admin data and agents data
    if (!admin) {
      fetchAdminData();
    } else {
      fetchAgents();
    }
  }, [admin]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://trcnfx.com/api/agents/${id}`);
      setAgents(agents.filter((agent) => agent._id !== id));
      setFilteredAgents(filteredAgents.filter((agent) => agent._id !== id));
      alert("Agent deleted successfully.");
    } catch (error) {
      console.error("Error deleting agent:", error);
      alert("Failed to delete agent.");
    }
  };

  const handleSearch = () => {
    const filtered = agents.filter((agent) => {
      return (
        agent.agentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredAgents(filtered);
  };

  return (
    <div className="admin-panel">
      <h2>Agents</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <div style={{ display: "flex" }}>
          <input
            style={{ width: "500px" }}
            type="text"
            placeholder="Search by Agent ID or Name"
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

      <table className="admin-table">
        <thead>
          <tr>
            <th>Agent ID</th>
            <th>Name</th>
            <th>Team</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAgents.map((agent) => (
            <tr key={agent._id}>
              <td>{agent.agentId}</td>
              <td>{agent.name}</td>
              <td>{agent.team}</td>
              <td>
                <button
                  style={{
                    border: "1px solid #007bff",
                    background: "none",
                    color: "#007bff",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "5px",
                  }}
                  onClick={() => handleDelete(agent._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Agents;
