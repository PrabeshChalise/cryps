import React, { useEffect, useState } from "react";
import axios from "axios";

const DeleteAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("https://trcnfx.com/api/admins");
      setAdmins(res.data);
      setFilteredAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://trcnfx.com/api/admins/delete/${id}`);
      setAdmins(admins.filter((admin) => admin._id !== id));
      setFilteredAdmins(filteredAdmins.filter((admin) => admin._id !== id));
      alert("Admin deleted successfully");
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin");
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filtered = admins.filter((admin) =>
      admin.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredAdmins(filtered);
  };

  return (
    <div style={{ margin: "20px" }}>
      <h2>Admin List</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search admin by name"
        style={{
          padding: "10px",
          marginBottom: "20px",
          width: "100%",
          maxWidth: "300px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredAdmins.length === 0 ? (
            <tr>
              <td colSpan="2" style={{ padding: "10px", textAlign: "center" }}>
                No admins found
              </td>
            </tr>
          ) : (
            filteredAdmins.map((admin) => (
              <tr key={admin._id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {admin.name}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button
                    onClick={() => handleDelete(admin._id)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeleteAdmin;
