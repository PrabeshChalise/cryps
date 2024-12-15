import React, { useState } from "react";
import axios from "axios";
import "./Login.css"; // Import the CSS file for styling
import ForgotPasswordModal from "./ForgotPasswordModal";
import SignupModal from "./SignupModal"; // Import the SignupModal component
import MessageModal from "./MessageModal"; // Import the MessageModal component

export default function Login({ closeModal }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false); // State for showing/hiding SignupModal
  const [showMessageModal, setShowMessageModal] = useState(false); // State for showing/hiding MessageModal
  const [message, setMessage] = useState(""); // State for the message to be shown in the MessageModal
  const [passwordVisible, setPasswordVisible] = useState(false); // State for toggling password visibility

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://trcnxf.com/api/register/Signup",
        credentials
      );
      const data = response.data;
      if (
        data.message === "No such user found" ||
        data.message === "Incorrect password"
      ) {
        setMessage(data.message);
        setShowMessageModal(true);
      } else {
        localStorage.setItem("authToken", data.authToken);
        localStorage.setItem("userId", data.userdata.userId);
        localStorage.setItem("_id", data.userdata._id);
        localStorage.setItem("walletAddress", data.userdata.walletAddress);
        setMessage("Successfully logged in!");
        setShowMessageModal(true);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setMessage("Error logging in. Please try again.");
      setShowMessageModal(true);
    }
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    closeModal();
  };

  return (
    <div className="modal" style={{ marginTop: "50px" }}>
      <div className="modal-content">
        <span className="close" onClick={closeModal}>
          &times;
        </span>
        <h2
          style={{
            fontWeight: "600",
            fontSize: "20px",
            borderBottom: "1px solid #7b7d7e",
            display: "inline-block", // Makes the border align with text width
            textAlign: "center", // Centers text inside the block
          }}
        >
          Login
        </h2>
        <form id="loginForm" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group" style={{ position: "relative" }}>
            <label htmlFor="password">Password</label>
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              style={{
                paddingRight: "40px", // Add padding to prevent text from overlapping with the eye icon
                height: "40px", // Adjust height for better alignment
                lineHeight: "40px", // Ensure text and icon align vertically
              }}
            />
            <i
              className={`fa ${passwordVisible ? "fa-eye-slash" : "fa-eye"}`}
              style={{
                position: "absolute",
                right: "10px",
                marginTop: "15px",
                top: "50%", // Vertically center
                transform: "translateY(-50%)", // Adjust for centering
                cursor: "pointer",
                fontSize: "18px", // Adjust size for better visibility
                color: "#9ca3af", // Match with the design
              }}
              onClick={() => setPasswordVisible(!passwordVisible)}
            ></i>
          </div>

          <button
            type="submit"
            className="submit-button"
            style={{ backgroundColor: "#6AA1F4" }}
          >
            Login
          </button>
        </form>
        <div className="signup-link">Don't have an account? </div>
        <button
          style={{
            marginTop: "10px",
            backgroundColor: "green",
            color: "white",
            width: "300px",
            height: "50px",
          }}
          onClick={() => setShowSignupModal(true)}
        >
          Create Account
        </button>
        <div className="forgot-password-link" style={{ marginTop: "10px" }}>
          <span
            onClick={() => setShowForgotPassword(true)}
            style={{ color: "red", marginTop: "10px" }}
          >
            Forgot Password?
          </span>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal closeModal={() => setShowForgotPassword(false)} />
      )}
      {showSignupModal && (
        <SignupModal closemod={() => setShowSignupModal(false)} />
      )}
      {showMessageModal && (
        <MessageModal message={message} onClose={handleCloseMessageModal} />
      )}
    </div>
  );
}
