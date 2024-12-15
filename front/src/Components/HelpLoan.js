import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../wallet/WalletDashboard.css";
import logo3 from "./logo3.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import SignupModal from "./SignupModal"; // Import the SignupModal component
import Login from "./Login"; // Import the Login component

export default function HelpLoan() {
  const uid = localStorage.getItem("_id");
  const userrid = localStorage.getItem("userId");
  const [showLoginModal, setShowLoginModal] = useState(false); // State to manage login modal visibility
  const [showSignupModal, setShowSignupModal] = useState(false); // State to manage signup modal visibility
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to manage login status
  const [kycStatus, setKycStatus] = useState(""); // State to manage KYC status
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    repaymentPeriod: "1day",
    dailyInterestRate: 2,
    feeRate: 0,
    handlingFee: 10,
    houseInfo: null,
    proofOfIncome: null,
    bankDetails: null,
    idPhoto: null,
  });

  useEffect(() => {
    // Check if the user is logged in by checking the localStorage for authToken
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }

    const fetchKycStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/kyc/${uid}`
        );
        setKycStatus(response.data.status);
      } catch (error) {
        console.error("Error fetching KYC status:", error);
      }
    };

    if (uid) {
      fetchKycStatus();
    }
  }, [uid]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const renderKycStatus = () => {
    if (kycStatus === "approved") {
      return (
        <p className="kyc-status">
          Verified{" "}
          <i className="fas fa-check-circle" style={{ color: "white" }}></i>
        </p>
      );
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });
    formDataToSend.append("uid", uid);
    formDataToSend.append("userId", userrid);

    try {
      await axios.post("http://localhost:3001/api/apply-loan", formDataToSend);
      alert("Loan application submitted successfully!");
    } catch (error) {
      console.error("Error submitting loan application:", error);
      alert("Failed to submit loan application.");
    }
  };

  return (
    <div className="container">
      <header>
        <div
          className="title-container"
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
          }}
        >
          <h1>
            <Link to="/">TRCNFX</Link>
          </h1>
          <button className="menu-button" onClick={toggleMenu}>
            &#9776;
          </button>
        </div>
      </header>

      <div id="sidebar" className={`sidebar ${isMenuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src={logo3} alt="logo" />
          <p>
            <b>UID: {userrid}</b>
          </p>
          {renderKycStatus()}
        </div>

        <div className="functions">
          <ul>
            <li>
              <button className="link" onClick={() => navigate("/wallet")}>
                <i className="fas fa-wallet"></i> Wallet
              </button>
            </li>
            <li>
              <button className="link" onClick={() => navigate("/tradepage")}>
                <i className="fas fa-exchange-alt"></i> Trade
              </button>
            </li>
            <li>
              <button className="link" onClick={() => navigate("/result")}>
                <i className="fas fa-chart-line"></i> Result
              </button>
            </li>
            <li>
              <button className="link" onClick={() => navigate("/transaction")}>
                <i className="fas fa-pen"></i> Transactions
              </button>
            </li>
            <li>
              <button className="link" onClick={() => navigate("/terms")}>
                <i className="fas fa-book"></i> Privacy Policy
              </button>
            </li>
            <li>
              <button
                className="link"
                onClick={() => navigate("/profit-stats")}
              >
                <i className="fas fa-chart-bar"></i> Profit Statistics
              </button>
            </li>
            <li>
              <button className="link" onClick={() => navigate("/helpLoan")}>
                <i className="fas fa-book"></i> Help Loan
              </button>
            </li>
            <li>
              <button className="link" onClick={() => navigate("/contactUs")}>
                <i className="fas fa-phone"></i> Contact Us
              </button>
            </li>
          </ul>
          <div className="more-options">
            <ul>
              {isLoggedIn ? (
                <li>
                  <Link to="/settings">
                    <i className="fa-solid fa-gear"></i> Settings
                  </Link>
                </li>
              ) : (
                <li>
                  <button onClick={() => setShowLoginModal(true)}>
                    <i className="fa-solid fa-person"></i> Login
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="main-content">
        <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
          Apply for a Loan
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label style={{ marginBottom: "5px", display: "block" }}>
              Expected Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label style={{ marginBottom: "5px", display: "block" }}>
              Repayment Period
            </label>
            <select
              name="repaymentPeriod"
              value={formData.repaymentPeriod}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="1day">1 Day</option>
              <option value="1week">1 Week</option>
              <option value="1month">1 Month</option>
              <option value="3months">3 Months</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label style={{ marginBottom: "5px", display: "block" }}>
              Daily Interest Rate
            </label>
            <input
              type="text"
              name="dailyInterestRate"
              value={formData.dailyInterestRate}
              readOnly
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label style={{ marginBottom: "5px", display: "block" }}>
              Fee Rate
            </label>
            <input
              type="number"
              name="feeRate"
              value={(formData.amount * 0.01).toFixed(2)}
              readOnly
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label style={{ marginBottom: "5px", display: "block" }}>
              Handling Fee
            </label>
            <input
              type="text"
              name="handlingFee"
              value={formData.handlingFee}
              readOnly
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label style={{ marginBottom: "5px", display: "block" }}>
              House Information
            </label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <i
                className="fas fa-home"
                style={{ marginRight: "10px", fontSize: "24px" }}
              ></i>
              <input
                type="file"
                name="houseInfo"
                onChange={handleChange}
                required
                style={{ flex: "1" }}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label style={{ marginBottom: "5px", display: "block" }}>
              Proof of Income
            </label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <i
                className="fas fa-file-invoice-dollar"
                style={{ marginRight: "10px", fontSize: "24px" }}
              ></i>
              <input
                type="file"
                name="proofOfIncome"
                onChange={handleChange}
                required
                style={{ flex: "1" }}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label style={{ marginBottom: "5px", display: "block" }}>
              Bank Details
            </label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <i
                className="fas fa-university"
                style={{ marginRight: "10px", fontSize: "24px" }}
              ></i>
              <input
                type="file"
                name="bankDetails"
                onChange={handleChange}
                required
                style={{ flex: "1" }}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label style={{ marginBottom: "5px", display: "block" }}>
              ID Photo
            </label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <i
                className="fas fa-id-card"
                style={{ marginRight: "10px", fontSize: "24px" }}
              ></i>
              <input
                type="file"
                name="idPhoto"
                onChange={handleChange}
                required
                style={{ flex: "1" }}
              />
            </div>
          </div>
          <button
            type="submit"
            className="apply-button"
            style={{
              display: "block",
              width: "100%",
              padding: "15px",
              fontSize: "18px",
              color: "#fff",
              backgroundColor: "#007bff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Apply Now
          </button>
        </form>
      </div>
      {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} />}
      {showSignupModal && (
        <SignupModal closeModal={() => setShowSignupModal(false)} />
      )}
    </div>
  );
}
