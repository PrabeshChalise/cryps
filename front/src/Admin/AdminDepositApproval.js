import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import "./AdminPanel.css";
import "../wallet/WalletDashboard.css"; // Import the CSS file for styling

const AdminDepositApproval = () => {
  const { userId } = useParams(); // Get the userId from the URL parameters
  const navigate = useNavigate(); // Initialize navigate

  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]); // State for filtered deposits
  const [showModal, setShowModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false); // State for showing decline modal
  const [currentDeposit, setCurrentDeposit] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [isLoading, setIsLoading] = useState(false); // State for loading
  useEffect(() => {
    const adminId = localStorage.getItem("adminId"); // Retrieve the adminId from localStorage

    if (adminId) {
      fetchDepositsForAdmin(adminId); // Fetch deposits for the logged-in admin
    } else if (userId) {
      fetchDepositsForUser(userId);
    }
  }, [userId]);

  const fetchDepositsForAdmin = async (adminId) => {
    try {
      const response = await axios.get(
        `https://trcnfx.com/api/deposits-for-admin/${adminId}`
      );
      setPendingDeposits(response.data);
      setFilteredDeposits(response.data);
    } catch (error) {
      console.error("Error fetching deposits for admin:", error);
    }
  };

  const fetchDepositsForUser = async (userId) => {
    try {
      const response = await axios.get(
        `https://trcnfx.com/api/deposits/user/${userId}`
      );
      setPendingDeposits(response.data);
      setFilteredDeposits(response.data);
    } catch (error) {
      console.error("Error fetching deposits for user:", error);
    }
  };

  const handleSearch = () => {
    const filtered = pendingDeposits.filter(
      (deposit) =>
        (deposit.uid &&
          deposit.uid.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (deposit.userId.agentUID &&
          deposit.userId.agentUID
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );
    setFilteredDeposits(filtered);
  };

  const handleApprove = async (id, updatedAmount) => {
    setIsLoading(true); // Start loading
    try {
      await axios.post(`https://trcnfx.com/api/deposits/${id}/approve`, {
        amount: updatedAmount,
      });
      alert("Deposit approved successfully");
      setPendingDeposits(
        pendingDeposits.filter((deposit) => deposit._id !== id)
      );
      setFilteredDeposits(
        filteredDeposits.filter((deposit) => deposit._id !== id)
      );
    } catch (error) {
      console.error("Error approving deposit:", error);
      alert("Failed to approve deposit");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.delete(`https://trcnfx.com/api/deposits/${id}`);
      alert("Deposit declined successfully");
      setPendingDeposits(
        pendingDeposits.filter((deposit) => deposit._id !== id)
      );
      setFilteredDeposits(
        filteredDeposits.filter((deposit) => deposit._id !== id)
      );
    } catch (error) {
      console.error("Error declining deposit:", error);
      alert("Failed to decline deposit");
    } finally {
      setShowDeclineModal(false); // Close the decline modal
    }
  };

  const handleActionClick = (deposit) => {
    setCurrentDeposit(deposit);
    setShowModal(true);
  };

  const handleDeclineClick = (deposit) => {
    setCurrentDeposit(deposit);
    setShowDeclineModal(true); // Show the decline modal
  };

  const handleConfirmAction = async () => {
    await handleApprove(currentDeposit._id, currentDeposit.amount);

    // After approval, update the status to "completed"
    try {
      await axios.post(
        `https://trcnfx.com/api/deposits/${currentDeposit._id}/complete`
      );
      alert("Deposit status updated to completed");
    } catch (error) {
      console.error("Error updating deposit status:", error);
    }

    setShowModal(false);
  };

  const handleCancelAction = () => {
    setShowModal(false);
    setShowDeclineModal(false); // Close the decline modal if canceling
  };

  const handleAmountChange = (e) => {
    setCurrentDeposit({
      ...currentDeposit,
      amount: parseFloat(e.target.value),
    });
  };

  const handleBackToAllDeposits = () => {
    navigate("/admin/deposit-approval"); // Navigate back to the full list of deposits
  };

  return (
    <div className="admin-panel">
      <h2>
        <b style={{ color: "black", fontSize: "18px" }}>
          {userId
            ? `Recharge Requests for User: ${userId}`
            : "Recharge Requests"}
        </b>
      </h2>
      {!userId && ( // Show search bar and all deposits if no specific user is selected
        <div className="mb-4">
          <div style={{ display: "flex" }}>
            <input
              style={{ width: "500px" }}
              type="text"
              placeholder="Search by User ID or Agent ID"
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
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Agent ID</th>
            <th>User ID</th>
            <th>Amount</th>
            <th>Coin</th>
            <th>Proof</th>
            <th>Date and Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDeposits.map((deposit) => (
            <tr key={deposit._id}>
              <td>
                {deposit.userId && deposit.userId.agentUID
                  ? deposit.userId.agentUID
                  : "N/A"}
              </td>
              <td>{deposit.uid}</td>
              <td>
                {deposit.amount} {deposit.selectedSymbol}
              </td>
              <td>{deposit.selectedSymbol.toUpperCase()}</td>
              <td>
                <a
                  href={deposit.proof}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Proof
                </a>
              </td>
              <td>{format(new Date(deposit.createdAt), "PPpp")}</td>
              <td>
                <button
                  style={{ border: "1px solid #000" }}
                  onClick={() => handleActionClick(deposit)}
                >
                  Approve
                </button>
                <button
                  style={{ border: "1px solid red", marginLeft: "10px" }}
                  onClick={() => handleDeclineClick(deposit)}
                >
                  Decline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {userId && (
        <button
          className="mt-4 bg-gray-500 text-white py-1 px-3 rounded"
          onClick={handleBackToAllDeposits}
        >
          Back to All Deposits
        </button>
      )}

      {/* Approve Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{currentDeposit.selectedSymbol.toUpperCase()} Recharge</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmAction();
              }}
            >
              <div className="form-group">
                <label>Currency</label>
                <input
                  type="text"
                  value={currentDeposit.selectedSymbol.toUpperCase()}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  value={currentDeposit.amount}
                  onChange={handleAmountChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="submit-button"
                style={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  position: "relative",
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
                disabled={isLoading} // Disable the button when loading
              >
                {isLoading ? (
                  <div
                    className="loading-overlay"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      zIndex: 1000,
                    }}
                  >
                    <div
                      className="loading-spinner"
                      style={{
                        border: "4px solid #f3f3f3",
                        borderTop: "4px solid #3498db",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        animation: "spin 1s linear infinite",
                      }}
                    ></div>
                  </div>
                ) : (
                  "Approve"
                )}
              </button>
              <button type="button" onClick={handleCancelAction}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Decline Confirmation</h2>
            <p>Are you sure you want to decline this deposit?</p>
            <button
              onClick={() => handleDecline(currentDeposit._id)}
              className="submit-button"
              style={{ backgroundColor: "red", color: "white" }}
            >
              Confirm Decline
            </button>
            <button type="button" onClick={handleCancelAction}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepositApproval;
