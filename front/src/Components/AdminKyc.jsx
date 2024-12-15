import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminKyc = () => {
  const [kycRequests, setKycRequests] = useState([]);

  useEffect(() => {
    const fetchKycRequests = async () => {
      try {
        const response = await axios.get("https://trcnfx.com/api/kyc");
        setKycRequests(response.data);
      } catch (error) {
        console.error("Error fetching KYC requests:", error);
      }
    };
    fetchKycRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(`https://trcnfx.com/api/kyc/${id}/approve`);
      setKycRequests(kycRequests.filter((request) => request._id !== id));
    } catch (error) {
      console.error("Error approving KYC:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`https://trcnfx.com/api/kyc/${id}/reject`);
      setKycRequests(kycRequests.filter((request) => request._id !== id));
    } catch (error) {
      console.error("Error rejecting KYC:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>KYC Requests</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>DATE OF BIRTH</th>
            <th style={styles.th}>COUNTRY</th>
            <th style={styles.th}>ADDRESS</th>
            <th style={styles.th}>ZIP</th>
            <th style={styles.th}>CONTACT</th>
            <th style={styles.th}>IDENTITY PROOF</th>
            <th style={styles.th}>PHOTO</th>
            <th style={styles.th}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {kycRequests.map((request) => (
            <tr key={request._id}>
              <td style={styles.td}>
                {new Date(request.dob).toLocaleDateString()}
              </td>
              <td style={styles.td}>{request.country}</td>
              <td style={styles.td}>{request.address}</td>
              <td style={styles.td}>{request.zip}</td>
              <td style={styles.td}>{request.contact}</td>
              <td style={styles.td}>
                <img
                  src={`https://trcnfx.com/${request.identityProof}`}
                  alt="Identity Proof"
                  style={styles.image}
                />
              </td>
              <td style={styles.td}>
                <img
                  src={`https://trcnfx.com/${request.photo}`}
                  alt="Photo"
                  style={styles.image}
                />
              </td>
              <td style={styles.td}>
                <button
                  style={styles.approveButton}
                  onClick={() => handleApprove(request._id)}
                >
                  Approve
                </button>
                <button
                  style={styles.rejectButton}
                  onClick={() => handleReject(request._id)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    padding: "20px",
    boxSizing: "border-box",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
    fontSize: "16px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  th: {
    border: "1px solid #ddd",
    padding: "12px",
    textAlign: "center",
    backgroundColor: "#343a40",
    color: "white",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  td: {
    border: "1px solid #ddd",
    padding: "12px",
    textAlign: "center",
    color: "#333",
  },
  image: {
    width: "100px",
    borderRadius: "5px",
  },
  approveButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "8px 16px",
    margin: "5px",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  rejectButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 16px",
    margin: "5px",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "14px",
    fontWeight: "bold",
  },
};

export default AdminKyc;
