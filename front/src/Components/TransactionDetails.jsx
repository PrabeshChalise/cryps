import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import "./TransactionDetails.css";
import logo1 from "./logoResult.png";
import logo3 from "./logo3.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Sidebar from "./Sidebar";
const TransactionDetails = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [logoBase64, setLogoBase64] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef();
  const mainContentRef = useRef();
  const downloadButtonRef = useRef();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const uid = localStorage.getItem("userId");
  const [kycStatus, setKycStatus] = useState(""); // State to manage KYC status
  const id1 = localStorage.getItem("_id");
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axios.get(
          `https://trcnfx.com/api/transaction/${transactionId}`
        );
        setTransaction(response.data);
        // console.log(response.data);

        let symbol = "";
        if (response.data.type === "conversion") {
          symbol = response.data.toSymbol;
        } else {
          symbol = response.data.selectedSymbol || response.data.symbol;
        }

        if (symbol) {
          const logoResponse = await axios.get(
            `https://pro-api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}`,
            {
              headers: {
                "X-Cg-Pro-Api-Key": "CG-abdEKxm7HXgBnnG2D2eexnmq",
              },
            }
          );

          const imageUrl = logoResponse.data.image.large;
          const imageResponse = await axios.get(
            "https://trcnfx.com/api/fetch-image",
            {
              params: { imageUrl },
            }
          );
          setLogoBase64(`data:image/jpeg;base64,${imageResponse.data.image}`);
        }
      } catch (error) {
        console.error("Error fetching transaction or logo:", error);
      }
    };

    fetchTransaction();
  }, [transactionId]);
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const response = await axios.get(`https://trcnfx.com/api/kyc/${id1}`);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleLogout = () => {
    // Clear user-related data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("_id");
    localStorage.removeItem("userId");
    localStorage.removeItem("selectedCurrency");

    // Redirect to the login page
    navigate("/");
  };
  const captureScreenshot = useCallback(async () => {
    if (mainContentRef.current && logoLoaded) {
      downloadButtonRef.current.style.display = "none";
      const canvas = await html2canvas(mainContentRef.current);
      downloadButtonRef.current.style.display = "block";

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "transaction_report.png";
      link.click();
    }
  }, [logoLoaded]);

  const handleLogoLoad = () => {
    setLogoLoaded(true);
  };

  const handleLogoError = () => {
    console.error("Error loading logo.");
  };

  if (!transaction) {
    return <div>Loading...</div>;
  }

  const symbol =
    transaction.toSymbol || transaction.selectedSymbol || transaction.symbol;
  const amount = transaction.amount || transaction.convertedAmount;
  const transactionType =
    transaction.type === "deposit"
      ? "Receive"
      : transaction.type === "conversion"
      ? "conversion"
      : "send";

  const isCompleted =
    transaction.status === "completed" ||
    transaction.status === "complete" ||
    transaction.approved === true;
  const statusClass = isCompleted ? "completed" : "pending";
  const statusIcon = isCompleted ? "✓" : "⏳";
  const statusMessage = isCompleted ? "Completed" : "Pending";

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
          <button
            className="header-text"
            onClick={() => navigate(-1)}
            style={{
              marginRight: "10px",
              fontSize: "24px",
              background: "none",
              border: "none",
              cursor: "pointer",
              // color: "white",
            }}
          >
            &#8592;
          </button>
          <h1 className="header-text">Transaction Details</h1>
          <button className="menu-button" onClick={toggleMenu}>
            &#9776;
          </button>
        </div>
      </header>

      <Sidebar
        // email={email}
        // userId={userId}
        kycStatus={kycStatus}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        handleLogout={handleLogout}
        sidebarRef={sidebarRef}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={captureScreenshot}
          ref={downloadButtonRef}
          style={{
            padding: "10px",
            fontSize: "16px",
            cursor: "pointer",
            background: "none",
            border: "none",
            marginTop: "30px",
          }}
          disabled={!logoLoaded} // Disable button until logo is loaded
        >
          <i className="fas fa-download" style={{ fontSize: "24px" }}></i>
        </button>
      </div>

      <div className="main-content" ref={mainContentRef}>
        <div className="transaction-details">
          <h1 className="report-title" style={{ color: "black" }}>
            Transaction Report
            <hr className="underline" />
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <img
              src={logo1}
              alt="logo"
              style={{ height: "100px", width: "140px" }}
            />
          </div>

          <div className="report-header">
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={logoBase64}
                alt={`${symbol} logo`}
                className="logo-top-left"
                onLoad={handleLogoLoad}
                onError={handleLogoError}
              />
              <div style={{ marginLeft: "10px" }}>
                <span className="symbol" style={{ fontSize: "15px" }}>
                  {symbol.toUpperCase()}
                </span>
                <div
                  className="symbol-timestamp"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <span className="timestamp">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="content">
            <div>
              <p className="label">
                Amount:{" "}
                <span className="value">
                  {amount} {symbol}
                </span>
              </p>
              {transactionType === "send" && (
                <p className="label">
                  Sent to: <span className="value">{transaction.address}</span>
                </p>
              )}
              <p className="label">
                Status:{" "}
                <span className={`value ${statusClass}`}>
                  {statusIcon} {statusMessage}
                </span>
              </p>
              <p className="label">
                Transaction Type:{" "}
                <span className="value">{transactionType}</span>
              </p>
              <p className="label">
                Date:{" "}
                <span className="value">
                  {new Date(transaction.createdAt).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
