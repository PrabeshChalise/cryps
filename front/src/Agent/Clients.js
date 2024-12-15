import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal"; // Import the Modal component
import KycModal from "../Admin/KycModal"; // Import the KycModal component

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycDetails, setKycDetails] = useState(null);
  const [newClientId, setNewClientId] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      const agentId = localStorage.getItem("agentId");
      if (!agentId) {
        console.error("Agent ID not found in local storage.");
        return;
      }
      try {
        const response = await axios.get(
          `https://trcnfx.com/api/assigned-clients/${agentId}`
        );
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  const handleRequestClient = async () => {
    const agentId = localStorage.getItem("agentId");
    if (!agentId) {
      console.error("Agent ID not found in local storage.");
      return;
    }
    try {
      await axios.post("https://trcnfx.com/api/request-client", {
        agentId,
        clientId: newClientId,
      });
      setShowRequestModal(false);
      setNewClientId("");
    } catch (error) {
      console.error("Error requesting client:", error);
    }
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Clients</h2>
      <button
        className="mb-4 bg-green-500 text-white py-2 px-4 rounded"
        onClick={() => setShowRequestModal(true)}
      >
        Request Client
      </button>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-2">User ID</th>
            <th className="py-2">Email</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client._id}>
              <td className="border px-4 py-2">{client.userId}</td>
              <td className="border px-4 py-2">{client.email}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => viewKycDetails(client._id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  View KYC Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <KycModal
        show={showKycModal}
        onClose={closeKycModal}
        kycDetails={kycDetails}
      />

      {/* Request Client Modal */}
      <Modal
        show={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onConfirm={handleRequestClient}
        message="Enter Client ID to request"
      >
        <input
          type="text"
          value={newClientId}
          onChange={(e) => setNewClientId(e.target.value)}
          className="border px-2 py-1 rounded w-full"
          placeholder="Client ID"
        />
      </Modal>
    </div>
  );
};

export default Clients;
