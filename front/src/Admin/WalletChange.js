import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

const WalletChange = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered user list
  const [selectedUser, setSelectedUser] = useState(null); // Store selected _id here
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  const adminId = localStorage.getItem("adminId");

  useEffect(() => {
    // Fetch users (clients of the agents assigned to the logged-in admin)
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `https://trcnfx.com/api/clients-for-admin/${adminId}`
        );
        setUsers(response.data);
        setFilteredUsers(response.data); // Initialize filteredUsers with the full list
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (adminId) {
      fetchUsers();
    }
  }, [adminId]);

  const handleOpenModal = (userId) => {
    setSelectedUser(userId); // Set the _id of the selected user
    // Fetch wallets for the selected user
    axios
      .get(`https://trcnfx.com/api/wallet/${userId}`)
      .then((response) => {
        setWallets(response.data.balances);
        setShowModal(true);
      })
      .catch((error) => {
        console.error("Error fetching wallets:", error);
      });
  };

  const handleSubmit = () => {
    // Increment the wallet amount using _id instead of userId
    axios
      .post("https://trcnfx.com/api/wallet4", {
        userId: selectedUser, // Pass the _id to the backend
        symbol: selectedWallet,
        amount: amount,
      })
      .then((response) => {
        console.log(response.data.message);
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Error updating wallet:", error);
      });
  };

  const handleSearch = () => {
    const filtered = users.filter((user) =>
      user.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2 style={{ marginBottom: "20px" }}>User List</h2>

      {/* Search input */}
      <div style={{ marginBottom: "20px", display: "flex" }}>
        <input
          type="text"
          placeholder="Search by User ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
          style={{ marginRight: "10px", width: "300px" }}
        />
        <Button
          variant="primary"
          onClick={handleSearch}
          style={{ width: "300px" }}
        >
          Search
        </Button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              User ID
            </th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Email</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr
              key={user._id}
              style={{
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                borderBottom: "1px solid #ddd",
              }}
            >
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {user.userId}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {user.email}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                <Button
                  variant="primary"
                  onClick={() => handleOpenModal(user._id)}
                  style={{ marginTop: "5px" }}
                >
                  Add Amount{" "}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for changing wallet details */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Wallet Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <select
            className="form-select w-100"
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          >
            <option value="" disabled>
              Select Wallet
            </option>
            {Object.keys(wallets)
              .filter((wallet) => wallet.toLowerCase() !== "usd") // Filter out USD
              .map((wallet) => (
                <option key={wallet} value={wallet}>
                  {wallet.toUpperCase()} - {wallets[wallet]}
                </option>
              ))}
          </select>
          <br />
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-control mt-3"
            style={{ padding: "10px", width: "100%" }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WalletChange;
