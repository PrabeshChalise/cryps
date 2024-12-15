import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import axios from "axios";

const Sidebar = ({
  sidebarRef,
  //   email,
  //   userId,
  //   kycStatus,
  //   handleNavigation,
  isMenuOpen,
  setIsMenuOpen,
  // handleLogout,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false); // State to manage login modal visibility

  const [kycStatus, setKycStatus] = useState(""); // State to manage KYC status

  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to manage login status

  const [email, setEmail] = useState(""); // State to hold the email
  const userId = localStorage.getItem("_id");
  const UIID = localStorage.getItem("userId");
  // const sidebarRef = useRef();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmNewPassword } = e.target.elements;

    if (newPassword.value !== confirmNewPassword.value) {
      alert("New passwords do not match");
      return;
    }

    try {
      await axios.post("https://trcnxf.com/api/change-password", {
        userId: userId, // Use the user ID from local storage
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      });
      setShowChangePasswordModal(false);
      alert("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password.");
    }
  };
  const handleLogout = () => {
    // Clear user-related data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("_id");
    localStorage.removeItem("userId");
    localStorage.removeItem("selectedCurrency");

    // Redirect to the login page
    navigate("/");
  };

  const handleNavigation = (route) => {
    if (isLoggedIn) {
      navigate(route);
    } else {
      setShowLoginModal(true);
    }
  };
  useEffect(() => {
    // Check if the user is logged in by checking the localStorage for authToken
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }

    const fetchKycStatus = async () => {
      try {
        const response = await axios.get(`https://trcnxf.com/api/kyc/${UIID}`);
        setKycStatus(response.data.status);
      } catch (error) {
        console.error("Error fetching KYC status:", error);
      }
    };

    if (userId) {
      fetchKycStatus();
    }
  }, [UIID]);
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        if (!userId) {
          console.error("User ID is not available in localStorage");
          return;
        }

        const response = await axios.get(
          `https://trcnxf.com/api/users/${userId}`
        );
        console.log("Fetched email:", response.data.email);
        setEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching email:", error);
      }
    };

    fetchEmail();
  }, [userId]);
  const renderKycStatus = () => {
    switch (kycStatus) {
      case "approved":
        return (
          <p className="header-text">
            Verified{" "}
            <i className="fas fa-check-circle" style={{ color: "green" }}></i>
          </p>
        );
      case "pending":
        return (
          <p className="header-text">
            KYC Pending{" "}
            <i
              className="fas fa-spinner fa-spin"
              style={{ color: "orange" }}
            ></i>
          </p>
        );
      case "rejected":
      default:
        return (
          <p className="header-text">
            Unverified{" "}
            <i className="fas fa-times-circle" style={{ color: "red" }}></i>
          </p>
        );
    }
  };

  return (
    <div
      ref={sidebarRef}
      id="sidebar"
      className={`sidebar ${isMenuOpen ? "open" : ""}`}
      // ref={sidebarRef}
    >
      <div className="sidebar-header">
        <p className="header-text" style={{ fontSize: "10px" }}>
          {email}
        </p>
        <p className="header-text">
          <b className="header-text">UID: {UIID}</b>
        </p>
        <div className="kyc-status-section">{renderKycStatus()}</div>
      </div>
      <div className="functions">
        <ul>
          {/* <li>
                <button
                  className="link"
                  onClick={() => handleNavigation("/wallet")}
                >
                  <i className="fas fa-wallet"></i> Wallet
                </button>
              </li> */}
          {/* <li>
                <button
                  className="link"
                  onClick={() => handleNavigation("/tradepage")}
                >
                  <i className="fas fa-exchange-alt"></i> Trade
                </button>
              </li> */}
          {/* <li>
                <button
                  className="link"
                  onClick={() => handleNavigation("/result")}
                >
                  <i className="fas fa-chart-line"></i> Result
                </button>
              </li> */}
          <li>
            <button
              className="link"
              onClick={() => handleNavigation("/transaction")}
            >
              <i className="fas fa-pen"></i> Transactions
            </button>
          </li>
          <li style={{ marginTop: "5px" }}>
            <button className="link" onClick={() => navigate("/profit-stats")}>
              <i className="fas fa-chart-bar"></i> Profit Statistics
            </button>
          </li>
          <li style={{ marginTop: "5px" }}>
            <button className="link" onClick={() => handleNavigation("/terms")}>
              <i className="fas fa-book"></i> Privacy Policy
            </button>
          </li>

          {/* <li>
                <button className="link" onClick={() => navigate("/helpLoan")}>
                  <i className="fas fa-book"></i> Help Loan
                </button>
              </li> */}
          <li style={{ marginTop: "5px" }}>
            <button className="link" onClick={() => navigate("/contactUs")}>
              <i className="fas fa-phone"></i> Contact Us
            </button>
          </li>
        </ul>
        <li style={{ marginTop: "5px" }}>
          <button
            className="link"
            onClick={() => {
              setShowChangePasswordModal(true);
              setIsMenuOpen(false);
              console.log("Sidebar closed:", isMenuOpen); // Debug log
            }}
          >
            <i className="fas fa-lock"></i> Change Password
          </button>
        </li>

        {/* <div className="more-options">
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
            </div> */}
        <div
          className="theme-toggle"
          style={{
            marginTop: "10px",
            display: "flex",
            // justifyContent: "center",
            // textAlign: "center",
            alignItems: "center",
          }}
        >
          {" "}
          <p className="header-text">
            <i
              class="fa fa-moon"
              aria-hidden="true"
              style={{ marginTop: "5px", marginRight: "15px" }}
            ></i>
            Dark Mode
          </p>
          <label
            className="theme-switch"
            style={{ marginTop: "13px", marginLeft: "10px" }}
          >
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleTheme}
            />
            <span className="slider"></span>
          </label>
        </div>

        <li>
          <button
            className="link"
            onClick={handleLogout}
            style={{ color: "red" }} // Call the logout function
          >
            <i className="fas fa-sign-out-alt" style={{ color: "red" }}></i>{" "}
            Logout
          </button>
        </li>
      </div>
      {showChangePasswordModal && (
        <div className="modal show1" style={{ marginTop: "50px" }}>
          <div className="modal-content1">
            <span
              className="close"
              onClick={() => setShowChangePasswordModal(false)}
            >
              &times;
            </span>
            <h2>Change Password</h2>
            <form onSubmit={handleChangePasswordSubmit}>
              <div className="form-group">
                <label>Old Password:</label>
                <input type="password" name="oldPassword" required />
              </div>
              <div className="form-group">
                <label>New Password:</label>
                <input type="password" name="newPassword" required />
              </div>
              <div className="form-group">
                <label>Confirm New Password:</label>
                <input type="password" name="confirmNewPassword" required />
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: "blue",
                  color: "white",
                  width: "300px",
                  height: "50px",
                  padding: "10px",
                }}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
