import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../wallet/WalletDashboard.css"; // Reuse the CSS file for styling
import logo3 from "./logo3.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Login from "./Login"; // Import the Login component
import SignupModal from "./SignupModal"; // Import the SignupModal component
import axios from "axios";
import { useTheme } from "../ThemeContext"; // Import ThemeContext
import Sidebar from "./Sidebar";
export default function ContactUs() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("_id"); // Get the MongoDB userId
  const uid = localStorage.getItem("userId"); // Get the 7-digit uid
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  const { isDarkMode, toggleTheme } = useTheme();
  const sidebarRef = useRef();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactUrls, setContactUrls] = useState({});
  const [kycStatus, setKycStatus] = useState(""); // State to manage KYC status

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }

    const fetchContactUrls = async () => {
      try {
        const response = await axios.get("https://trcnxf.com/api/contact-urls");
        setContactUrls(response.data);
      } catch (error) {
        console.error("Error fetching contact URLs:", error);
      }
    };

    fetchContactUrls();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current && // Check if the sidebarRef is available
        !sidebarRef.current.contains(event.target) && // Ensure the click is outside the sidebar
        isMenuOpen // Check if the menu is open
      ) {
        setIsMenuOpen(false); // Close the sidebar
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Listen for outside clicks
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup listener
    };
  }, [isMenuOpen]); // Add isMenuOpen as a dependency

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
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://trcnxf.com/api/contact", {
        title,
        description,
        userId,
        uid,
      });
      alert("Form submitted successfully");
      setTitle("");
      setDescription("");
      setShowForm(false); // Hide the form after submission
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };

  const handleContactViaSystem = () => {
    setShowForm(true);
  };

  const handleContactViaTelegram = () => {
    if (contactUrls.telegram) {
      window.open(contactUrls.telegram, "_blank");
    } else {
      alert("Telegram contact is not available at the moment.");
    }
  };

  const handleContactViaWhatsApp = () => {
    if (contactUrls.whatsapp) {
      window.open(contactUrls.whatsapp, "_blank");
    } else {
      alert("WhatsApp contact is not available at the moment.");
    }
  };

  const handleContactViaEmail = () => {
    if (contactUrls.email) {
      window.location.href = `mailto:${contactUrls.email}`;
    } else {
      alert("Email contact is not available at the moment.");
    }
  };

  return (
    <div className="container">
      <header style={{ backgroundColor: "var(--primary-color)" }}>
        <div
          className="title-container"
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
          }}
        >
          <h1 className="header-text">
            <b className="header-text">
              <Link to="/">TRCNFX</Link>
            </b>
          </h1>
          <button className="menu-button" onClick={toggleMenu}>
            &#9776;
          </button>
        </div>
      </header>
      <Sidebar
        sidebarRef={sidebarRef} // Pass the reference
        userId={userId}
        kycStatus={kycStatus}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      <div className="main-content">
        {/* <div className="banner">
          <h2 class>Contact Us</h2>
          <p>
            We're here to help! If you have any questions or need assistance,
            contact us through the options below.
          </p>
        </div> */}
        {!showForm ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              className="cntact-usss"
              onClick={handleContactViaSystem}
              style={{
                // backgroundColor: "#007bff",
                // color: "white",
                padding: "10px 0px 10px 10px", // borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                // justifyContent: "center",
              }}
            >
              <i
                className="fas fa-laptop"
                style={{ marginRight: "8px", color: "#007bff" }}
              ></i>
              Contact Us via System
            </button>
            <button
              className="cntact-usss"
              onClick={handleContactViaTelegram}
              style={{
                // backgroundColor: "#0088cc",
                // color: "white",
                padding: "10px 0px 10px 10px",
                // borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                // justifyContent: "center",
              }}
            >
              <i
                className="fab fa-telegram-plane"
                style={{ marginRight: "8px", color: "#0088cc" }}
              ></i>
              Contact Us via Telegram
            </button>
            <button
              className="cntact-usss"
              onClick={handleContactViaWhatsApp}
              style={{
                // backgroundColor: "#25d366",
                // color: "white",
                padding: "10px 0px 10px 10px",
                // borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                // justifyContent: "center",
              }}
            >
              <i
                className="fab fa-whatsapp"
                style={{ marginRight: "8px", color: "#25d366" }}
              ></i>
              Contact Us via WhatsApp
            </button>
            <button
              className="cntact-usss"
              onClick={handleContactViaEmail}
              style={{
                // backgroundColor: "#d14836",
                // color: "white",
                padding: "10px 0px 10px 10px",
                // borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                // justifyContent: "center",
                marginTop: "3px",
              }}
            >
              <i
                className="fas fa-envelope"
                style={{ marginRight: "8px", color: "#d14836" }}
              ></i>
              Contact Us via Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="input-field"
                style={{ height: "100px" }}
              ></textarea>
            </div>
            <button
              type="submit"
              className="submit-button"
              style={{ backgroundColor: "#4caf50", color: "white" }}
            >
              Submit
            </button>
          </form>
        )}
      </div>

      {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} />}
      {showSignupModal && (
        <SignupModal closeModal={() => setShowSignupModal(false)} />
      )}
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
}
