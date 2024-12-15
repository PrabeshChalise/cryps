import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "./Auth.css"; // Import CSS file for styling

const LoginAgent = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle state for password visibility
  const [notification, setNotification] = useState(""); // State for success/error notifications
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://trcnxf.com/api/agent/login", {
        name,
        password,
      });
      localStorage.setItem("agentId", response.data.agentId); // Store agentId in local storage
      setNotification("Login successful! Redirecting to dashboard...");

      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate("/tnega12-dashboard"); // Assuming '/dashboard' is the route for the dashboard
      }, 2000); // 2 seconds delay to show notification
    } catch (error) {
      const message =
        error.response?.status === 403
          ? "Your account is not approved yet. Please wait for admin approval."
          : "Login failed. Please check your credentials.";
      setNotification(message);
      console.error(error.response?.data || error); // Handle login error
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {notification && <p className="notification">{notification}</p>}{" "}
      {/* Show notifications */}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
            </span>
          </div>
        </div>
        <button type="submit" className="btn">
          Login
        </button>
      </form>
      {/* Redirect to Signup */}
      <p style={{ marginTop: "20px" }}>
        Don’t have an account?{" "}
        <button
          onClick={() => navigate("/agentSignup")}
          className="btn-link"
          style={{ color: "blue" }}
        >
          Signup
        </button>
      </p>
    </div>
  );
};

export default LoginAgent;
