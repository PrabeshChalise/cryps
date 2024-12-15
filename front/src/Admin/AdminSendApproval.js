import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCopy } from "react-icons/fa"; // Import the copy icon

const AdminSendApproval = () => {
  const [sendRequests, setSendRequests] = useState([]);
  const [filteredSendRequests, setFilteredSendRequests] = useState([]); // For filtering based on search
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  useEffect(() => {
    const adminId = localStorage.getItem("adminId"); // Retrieve the adminId from localStorage

    if (adminId) {
      fetchSendRequestsForAdmin(adminId); // Fetch send requests for the logged-in admin
    }
  }, []);

  const fetchSendRequestsForAdmin = async (adminId) => {
    try {
      const sendResponse = await axios.get(
        `https://trcnfx.com/api/send-requests-for-admin/${adminId}`
      );
      const userResponse = await axios.get("https://trcnfx.com/api/clients");
      setSendRequests(sendResponse.data);
      setFilteredSendRequests(sendResponse.data); // Initialize filteredSendRequests
      setUsers(userResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getUserDetails = (userId) => {
    const user = users.find((user) => user._id === userId);
    return user
      ? { userId: user.userId, agentUID: user.agentUID }
      : { userId: "Unknown", agentUID: "N/A" };
  };
  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.post(`https://trcnfx.com/api/send-requests/${id}/status`, {
        status,
      });
      alert(`Send request marked as ${status}`);
      setSendRequests(sendRequests.filter((request) => request._id !== id));
      setFilteredSendRequests(
        filteredSendRequests.filter((request) => request._id !== id)
      );
      setShowModal(false);
    } catch (error) {
      console.error(`Error marking send request as ${status}:`, error);
      alert(`Failed to mark send request as ${status}`);
    }
  };

  const handleOpenModal = (request, status) => {
    setCurrentRequest(request);
    setCurrentStatus(status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRequest(null);
    setCurrentStatus("");
  };

  const handleConfirmModal = () => {
    if (currentRequest && currentStatus) {
      handleUpdateStatus(currentRequest._id, currentStatus);
    }
  };

  const handleSearch = () => {
    const filtered = sendRequests.filter((request) => {
      const userDetails = getUserDetails(request.userId);
      return userDetails.userId
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
    setFilteredSendRequests(filtered);
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    alert("Address copied to clipboard");
  };

  return (
    <div className="admin-panel">
      <h2>Pending Send Requests</h2>

      {/* Search Bar */}
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

      <table className="admin-table">
        <thead>
          <tr>
            {" "}
            <th>Agent UID</th> {/* New column */}
            <th>User ID</th>
            <th>Cryptocurrency</th>
            <th>Amount</th>
            <th>Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSendRequests.map((request) => {
            const userDetails = getUserDetails(request.userId);
            return (
              <tr key={request._id}>
                {" "}
                <td>{userDetails.agentUID}</td> {/* New column value */}
                <td>{userDetails.userId}</td>
                <td>{request.symbol.toUpperCase()}</td>
                <td>{request.amount}</td>
                <td
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{request.address}</span>
                  <FaCopy
                    style={{
                      cursor: "pointer",
                      marginLeft: "8px",
                    }}
                    onClick={() => handleCopyAddress(request.address)}
                  />
                </td>
                <td>{request.status}</td>
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
                    onClick={() => handleOpenModal(request, "complete")}
                  >
                    Complete
                  </button>
                  <button
                    style={{
                      border: "1px solid #007bff",
                      background: "none",
                      color: "#007bff",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleOpenModal(request, "incomplete")}
                  >
                    Incomplete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <p>
              Are you sure you want to mark this request as {currentStatus}?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
                onClick={handleConfirmModal}
              >
                Confirm
              </button>
              <button
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
                onClick={handleCloseModal}
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

export default AdminSendApproval;
