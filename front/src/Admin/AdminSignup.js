import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "", // New email field
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("https://trcnfx.com/api/admin/signup", {
        name,
        email, // Pass email to the backend
        password,
      });
      alert(res.data.message);
    } catch (err) {
      console.error(err.response.data);
      alert("Signup failed");
    }
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
        Admin Signup
      </h2>
      <form
        style={{ display: "flex", flexDirection: "column" }}
        onSubmit={onSubmit}
      >
        {/* Name Field */}
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

        {/* Email Field */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            placeholder="Enter email"
            style={{
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              width: "100%",
            }}
          />
        </div>

        {/* Password Field */}
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

        {/* Confirm Password Field */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Re-enter Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
              placeholder="Confirm password"
              style={{
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                width: "100%",
              }}
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              <i
                className={
                  showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"
                }
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
          Signup
        </button>
      </form>

      {/* Already have an account? */}
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Already have an account?{" "}
        <button
          onClick={() => navigate("/admin/login")}
          style={{
            border: "none",
            backgroundColor: "transparent",
            textDecoration: "underline",
            color: "#007BFF",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default AdminSignup;
