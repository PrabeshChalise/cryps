import React, { useState } from "react";
import axios from "axios";

const MasterAdminSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://trcnfx.com/api/master-admin/signup", formData);
      setSuccess("Signup successful, waiting for approval.");
      setError(null);
    } catch (error) {
      setError("Signup failed.");
    }
  };

  return (
    <div>
      <h2>Master Admin Signup</h2>
      {success && <p>{success}</p>}
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          onChange={handleInputChange}
        />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default MasterAdminSignup;
