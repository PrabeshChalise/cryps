import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css"; // Assuming you have a CSS file for styling

export default function ContactUsControl() {
  const [telegramUrl, setTelegramUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchContactUrls = async () => {
      try {
        const response = await axios.get("https://trcnfx.com/api/contact-urls");
        setTelegramUrl(response.data.telegram || "");
        setWhatsappUrl(response.data.whatsapp || "");
        setEmail(response.data.email || "");
      } catch (error) {
        console.error("Error fetching contact URLs:", error);
      }
    };
    fetchContactUrls();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://trcnfx.com/api/contact-urls", {
        telegram: telegramUrl,
        whatsapp: whatsappUrl,
        email,
      });
      alert("Contact URLs updated successfully");
    } catch (error) {
      console.error("Error updating contact URLs:", error);
      alert("Error updating contact URLs");
    }
  };

  return (
    <div className="admin-panel">
      <h2>Contact Us URL Management</h2>
      <form onSubmit={handleSave} className="contact-urls-form">
        <div className="form-group">
          <label htmlFor="telegramUrl">Telegram URL:</label>
          <input
            type="text"
            id="telegramUrl"
            value={telegramUrl}
            onChange={(e) => setTelegramUrl(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="whatsappUrl">WhatsApp URL:</label>
          <input
            type="text"
            id="whatsappUrl"
            value={whatsappUrl}
            onChange={(e) => setWhatsappUrl(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <button
          type="submit"
          className="submit-button"
          style={{ backgroundColor: "green", color: "white" }}
        >
          Save
        </button>
      </form>
    </div>
  );
}
