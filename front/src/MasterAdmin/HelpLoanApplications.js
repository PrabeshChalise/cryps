import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal"; // Import the Modal component
import KycModal from "./KycModal"; // Import the KycModal component

const HelpLoanApplications = () => {
  const [loanApplications, setLoanApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycDetails, setKycDetails] = useState(null);

  useEffect(() => {
    const fetchLoanApplications = async () => {
      try {
        const response = await axios.get(
          "https://trcnfx.com/api/loan-applications"
        );
        setLoanApplications(response.data);
      } catch (error) {
        console.error("Error fetching loan applications:", error);
      }
    };
    fetchLoanApplications();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(
        `https://trcnfx.com/api/loan-applications/${selectedLoanId}`
      );
      setLoanApplications(
        loanApplications.filter((loan) => loan._id !== selectedLoanId)
      );
      setShowModal(false);
      setSelectedLoanId(null);
    } catch (error) {
      console.error("Error deleting loan application:", error);
    }
  };

  const openModal = (id) => {
    setSelectedLoanId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLoanId(null);
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
      <h2 className="text-2xl font-bold mb-4">Help Loan Applications</h2>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-2">Loan ID</th>
            <th className="py-2">User ID</th>
            <th className="py-2">UID</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Repayment Period</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loanApplications.map((loan) => (
            <tr key={loan._id}>
              <td className="border px-4 py-2">{loan._id}</td>
              <td className="border px-4 py-2">{loan.userId}</td>
              <td className="border px-4 py-2">{loan.uid}</td>
              <td className="border px-4 py-2">{loan.amount}</td>
              <td className="border px-4 py-2">{loan.repaymentPeriod}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openModal(loan._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => viewKycDetails(loan.userId)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  View KYC Details
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
        message="Are you sure you want to delete this loan application?"
      />

      <KycModal
        show={showKycModal}
        onClose={closeKycModal}
        kycDetails={kycDetails}
      />
    </div>
  );
};

export default HelpLoanApplications;
