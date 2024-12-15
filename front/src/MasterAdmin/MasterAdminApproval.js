import React, { useEffect, useState } from "react";
import axios from "axios";

const MasterAdminApproval = () => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("https://trcnfx.com/api/admins/pending");
        setAdmins(res.data);
      } catch (err) {
        console.error(err.response.data);
      }
    };

    fetchAdmins();
  }, []);

  const handleApproval = async (id, approved) => {
    try {
      const res = await axios.post(
        `https://trcnfx.com/api/admins/${id}/approve`,
        { approved }
      );
      alert(res.data.message);
      setAdmins(admins.filter((admin) => admin._id !== id));
    } catch (err) {
      console.error(err.response.data);
      alert("Approval failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        Pending Admin Approvals
      </h2>
      <table
        style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#4CAF50", color: "white" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Admin Name
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr
              key={admin._id}
              style={{
                backgroundColor: "#f9f9f9",
                borderBottom: "1px solid #ddd",
              }}
            >
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {admin.name}
              </td>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  textAlign: "center",
                }}
              >
                <button
                  onClick={() => handleApproval(admin._id, true)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    marginRight: "10px",
                    cursor: "pointer",
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(admin._id, false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Decline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {admins.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No pending admin approvals
        </p>
      )}
    </div>
  );
};

export default MasterAdminApproval;
