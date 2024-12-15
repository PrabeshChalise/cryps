// KycModal.js
import React from "react";

const KycModal = ({ show, onClose, kycDetails }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">KYC Details</h2>
        {kycDetails ? (
          <div>
            <p>
              <strong style={{ color: "black" }}>Date of Birth:</strong>{" "}
              {new Date(kycDetails.dob).toLocaleDateString()}
            </p>
            <p>
              <strong style={{ color: "black" }}>Country:</strong>{" "}
              {kycDetails.country}
            </p>
            <p>
              <strong style={{ color: "black" }}>Address:</strong>{" "}
              {kycDetails.address}
            </p>
            <p>
              <strong style={{ color: "black" }}>Zip:</strong> {kycDetails.zip}
            </p>
            <p>
              <strong style={{ color: "black" }}>Contact:</strong>{" "}
              {kycDetails.contact}
            </p>
            <p>
              <strong style={{ color: "black" }}>Identity Proof:</strong>
            </p>
            <img
              src={`https://trcnfx.com/${kycDetails.identityProof}`}
              alt="Identity Proof"
              width="100"
            />
            <p>
              <strong style={{ color: "black" }}>Photo:</strong>
            </p>
            <img
              src={`https://trcnfx.com/${kycDetails.photo}`}
              alt="Photo"
              width="100"
            />
          </div>
        ) : (
          <p style={{ color: "black" }}>KYC not found for this user.</p>
        )}
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default KycModal;
