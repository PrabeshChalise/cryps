import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ProfitChart from "./ProfitChart";
import logo3 from "./logo3.png";
import axios from "axios";
import Sidebar from "./Sidebar";
const ProfitStatistics = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("_id");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sidebarRef = useRef();
  const uid = localStorage.getItem("userId");
  const id1 = localStorage.getItem("_id");
  const [kycStatus, setKycStatus] = useState(""); // State to manage KYC status
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to manage login status
  const [showLoginModal, setShowLoginModal] = useState(false); // State to manage login modal visibility

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (route) => {
    if (isLoggedIn) {
      navigate(route);
    } else {
      setShowLoginModal(true);
    }
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

  useEffect(() => {
    // Check if the user is logged in by checking the localStorage for authToken
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }

    const fetchKycStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/kyc/${id1}`
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
  return (
    <div className="container">
      <header style={{ borderRadius: "0px" }}>
        <div
          className="title-container"
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            borderRadius: "0px",
          }}
        >
          <button
            className="back-button"
            onClick={() => navigate(-1)}
            style={{
              marginRight: "10px",
              fontSize: "24px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-color)",
            }}
          >
            &#8592;
          </button>
          <h1 className="header-text">
            <b className="header-text">
              {" "}
              <Link to="/" style={{ textDecoration: "none" }}>
                TRCNFX
              </Link>
            </b>
          </h1>
          <button className="menu-button" onClick={toggleMenu}>
            &#9776;
          </button>
        </div>
      </header>

      <Sidebar
        sidebarRef={sidebarRef}
        // email={email}
        userId={userId}
        kycStatus={kycStatus}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        // handleLogout={handleLogout}
      />

      <div className="main-content">
        <ProfitChart userId={userId} />
      </div>
      <div className="footer-nav">
        <ul className="footer-icons">
          <li
            onClick={() => handleNavigation("/")}
            style={{ marginLeft: "10px" }}
          >
            <i className="fas fa-home"></i>
            <span>Home</span>
          </li>
          <li onClick={() => handleNavigation("/tradepage")}>
            <i className="fas fa-exchange-alt"></i>
            <span>Trade</span>
          </li>{" "}
          <li onClick={() => handleNavigation("/result")}>
            <i className="fas fa-chart-line"></i>
            <span>Result</span>
          </li>
          <li
            onClick={() => handleNavigation("/wallet")}
            style={{ marginRight: "10px" }}
          >
            <i className="fas fa-wallet"></i>
            <span>Wallet</span>
          </li>
          {/* <li onClick={() => handleNavigation("/transaction")}>
              <i className="fas fa-pen"></i>
              <span>Transaction</span>
            </li> */}
          {/* <li onClick={() => handleNavigation("/profit-stats")}>
              <i className="fas fa-chart-bar"></i>
              <span>Profit Stats</span>
            </li> */}
        </ul>
      </div>
    </div>
  );
};

export default ProfitStatistics;
