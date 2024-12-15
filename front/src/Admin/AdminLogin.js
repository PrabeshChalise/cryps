import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { name, password } = formData;

  // Update form data on input change
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://trcnfx.com/api/admin/login",
        formData
      );

      // Store adminId and token in localStorage
      localStorage.setItem("adminId", response.data.adminId);
      localStorage.setItem("token", response.data.token);

      // Set a timeout to log out after 1 hour (3600000 milliseconds)
      setTimeout(() => {
        handleLogout();
      }, 3600000); // 1 hour
      // }, 60000);

      navigate("/nimda21/clients");
    } catch (error) {
      alert("Invalid credentials or Admin not approved");
    }
  };

  // Handle logout by removing adminId and token from localStorage
  const handleLogout = () => {
    localStorage.removeItem("adminId");
    localStorage.removeItem("token");
    alert("Session expired. Please log in again.");
    navigate("/admin/login");
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        backgroundColor: "#f7f7f7",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        Admin Login
      </h2>
      <form
        style={{ display: "flex", flexDirection: "column" }}
        onSubmit={handleSubmit}
      >
        <div style={{ marginBottom: "15px" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Name
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
            placeholder="Enter admin name"
            style={{
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              width: "100%",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Enter password"
              style={{
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                width: "100%",
              }}
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
              <i
                className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
              ></i>
            </span>
          </div>
        </div>
        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Don't have an account?{" "}
        <button
          onClick={() => navigate("/admin/signup")}
          style={{
            border: "none",
            backgroundColor: "transparent",
            textDecoration: "underline",
            color: "#007BFF",
            cursor: "pointer",
          }}
        >
          Signup
        </button>
      </p>
    </div>
  );
};

export default AdminLogin;
