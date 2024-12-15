import React from "react";
import { useNavigate } from "react-router-dom";
import "./TransactionSummary.css"; // Import the CSS file

const TransactionSummary = ({ transaction, logo }) => {
  const navigate = useNavigate();

  const handleNavigateToDetails = () => {
    navigate(`/transaction/${transaction._id}`);
  };

  const isApproved =
    transaction.status === "completed" ||
    transaction.status === "complete" ||
    transaction.approved;
  const transactionAmount = transaction.amount;
  let transactionSymbol = "UNKNOWN";
  if (transaction.selectedSymbol) {
    transactionSymbol = transaction.selectedSymbol.toUpperCase();
  } else if (transaction.symbol) {
    transactionSymbol = transaction.symbol.toUpperCase();
  } else if (transaction.fromSymbol && transaction.toSymbol) {
    transactionSymbol = `${transaction.fromSymbol.toUpperCase()}-${transaction.toSymbol.toUpperCase()}`;
  }

  const statusClass = isApproved ? "completed" : "pending";
  const statusIcon = isApproved ? "✓" : "⏳";
  const statusMessage = isApproved ? "Completed" : "Pending";

  return (
    <div
      className="transaction-summary"
      style={{ marginTop: "8px", padding: "8px" }}
      onClick={handleNavigateToDetails}
      // style={{ backgroundColor: "#f0f0f0be" }}
    >
      <div className="summary-header">
        <div style={{ fontSize: "13px", display: "block" }}>
          <h2>
            <b className="header-text">{transactionSymbol}</b>
          </h2>
        </div>

        <p className="label" style={{ fontSize: "12px" }}>
          Amount: <span className="value">{transactionAmount}</span>
        </p>
      </div>
      <div style={{ display: "flex" }}>
        <p style={{ fontSize: "12px" }}>
          {new Date(transaction.createdAt).toLocaleString()}
        </p>
        <p
          className={`status ${statusClass}`}
          style={{ fontSize: "12px", marginLeft: "30px" }}
        >
          {statusIcon} <span>{statusMessage}</span>
        </p>
      </div>
    </div>
  );
};

export default TransactionSummary;
