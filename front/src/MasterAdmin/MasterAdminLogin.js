import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MasterAdminLogin = () => {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://trcnfx.com/api/master-admin/login",
        formData
      );
      localStorage.setItem("masterAdminId", response.data.masterAdminId);
      localStorage.setItem("token", response.data.token);

      // Set a timeout to log out after 1 hour (3600 seconds)
      setTimeout(() => {
        handleLogout();
      }, 3600000); // 1 hour = 3600000 milliseconds

      navigate("/masternimda21/dashboard");
    } catch (error) {
      setError("Invalid credentials or Master Admin not approved");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("masterAdminId");
    localStorage.removeItem("token");
    alert("Session expired. Please log in again.");
    navigate("/masternimda21/login");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f4f4",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h2
          style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}
        >
          Master Admin Login
        </h2>
        {error && (
          <p
            style={{ color: "red", textAlign: "center", marginBottom: "10px" }}
          >
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "12px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#0056b3";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#007bff";
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default MasterAdminLogin;
