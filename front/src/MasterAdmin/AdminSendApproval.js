import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCopy } from "react-icons/fa"; // Import the copy icon

const AdminSendApproval = () => {
  const [sendRequests, setSendRequests] = useState([]);
  const [filteredSendRequests, setFilteredSendRequests] = useState([]); // For filtering based on search
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [currentRequest, setCurrentRequest] = useState(null); // Current request being processed
  const [currentStatus, setCurrentStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  // Function to format the ISO date into a readable format
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sendResponse = await axios.get(
          "https://trcnfx.com/api/send-requests"
        );
        const userResponse = await axios.get("https://trcnfx.com/api/clients");
        setSendRequests(sendResponse.data);
        setFilteredSendRequests(sendResponse.data); // Initialize filteredSendRequests
        setUsers(userResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
      // Update send requests to remove the approved/rejected one
      setSendRequests(sendRequests.filter((request) => request._id !== id));
      setFilteredSendRequests(
        filteredSendRequests.filter((request) => request._id !== id)
      );
      setShowModal(false); // Close modal after action
    } catch (error) {
      console.error(`Error marking send request as ${status}:`, error);
      alert(`Failed to mark send request as ${status}`);
    }
  };

  const handleOpenModal = (request, status) => {
    setCurrentRequest(request); // Set current request details
    setCurrentStatus(status); // Set status (complete/incomplete)
    setShowModal(true); // Show modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Hide modal
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
            <th>Agent UID</th> {/* New column */}
            <th>User ID</th>
            <th>Cryptocurrency</th>
            <th>Amount</th>
            <th>Address</th>
            <th>Status</th>
            <th>Date and Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSendRequests.map((request) => {
            const userDetails = getUserDetails(request.userId);
            return (
              <tr key={request._id}>
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
                <td>{formatDate(request.createdAt)}</td> {/* Formatted date */}
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

      {/* Modal */}
      {showModal && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: "#fff",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            borderRadius: "8px",
          }}
        >
          <h3>Confirm Action</h3>
          <p>
            Are you sure you want to mark this send request as{" "}
            <strong>{currentStatus}</strong>?
          </p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={handleConfirmModal}
              style={{
                background: "#007bff",
                color: "#fff",
                padding: "10px 15px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Confirm
            </button>
            <button
              onClick={handleCloseModal}
              style={{
                background: "#f44336",
                color: "#fff",
                padding: "10px 15px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onClick={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AdminSendApproval;
