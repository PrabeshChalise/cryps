import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import KycModal from "./KycModal";
import { useNavigate } from "react-router-dom";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycDetails, setKycDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState(localStorage.getItem("adminId"));

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Fetch clients by admin's team
        const response = await axios.get(
          `https://trcnfx.com/api/clients-by-admin/${adminId}`
        );
        setClients(response.data);
        setFilteredClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, [adminId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`https://trcnfx.com/api/clients/${selectedClientId}`);
      setClients(clients.filter((client) => client._id !== selectedClientId));
      setFilteredClients(
        filteredClients.filter((client) => client._id !== selectedClientId)
      );
      setShowModal(false);
      setSelectedClientId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openModal = (id) => {
    setSelectedClientId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClientId(null);
  };

  const viewKycDetails = async (userId) => {
    try {
      const response = await axios.get(`https://trcnfx.com/api/kyc/${userId}`);
      setKycDetails(response.data);
    } catch (error) {
      console.error("Error fetching KYC details:", error);
      setKycDetails(null);
    }
    setShowKycModal(true);
  };

  const closeKycModal = () => {
    setShowKycModal(false);
    setKycDetails(null);
  };

  const handleSearch = () => {
    const filtered = clients.filter(
      (client) =>
        client.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.agentUID?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleNavigation = (clientId, path) => {
    navigate(`/${path}/${clientId}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Clients</h2>
      <div className="mb-4">
        <div style={{ display: "flex" }}>
          <input
            style={{ width: "500px" }}
            type="text"
            placeholder="Search by User ID or Admin UID"
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
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-2">Agent UID</th>
            <th className="py-2">User ID</th>
            <th className="py-2">Email</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map((client) => (
            <tr key={client._id}>
              <td className="border px-4 py-2">{client.agentUID || "N/A"}</td>
              <td className="border px-4 py-2">{client.userId}</td>
              <td className="border px-4 py-2">{client.email}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  onClick={() => viewKycDetails(client._id)}
                >
                  View KYC Details
                </button>
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                  onClick={() => handleNavigation(client._id, "nimda21/wallet")}
                >
                  Wallet Details
                </button>
                <button
                  className="bg-purple-500 text-white px-2 py-1 rounded mr-2"
                  onClick={() =>
                    handleNavigation(client._id, "nimda21/recharge-status")
                  }
                >
                  Recharge Status
                </button>
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  onClick={() =>
                    handleNavigation(client._id, "nimda21/trade-control")
                  }
                >
                  Trade Control
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        show={showModal}
        onClose={closeModal}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this user?"
      />

      <KycModal
        show={showKycModal}
        onClose={closeKycModal}
        kycDetails={kycDetails}
      />
    </div>
  );
};

export default Clients;
