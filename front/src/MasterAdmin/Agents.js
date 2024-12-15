import React, { useEffect, useState } from "react";
import axios from "axios";

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]); // For filtering based on search
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get("https://trcnfx.com/api/agents");
        setAgents(response.data);
        setFilteredAgents(response.data); // Initialize filteredAgents
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    fetchAgents();
  }, []);

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
