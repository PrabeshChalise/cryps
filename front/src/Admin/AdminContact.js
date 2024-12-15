import React, { useEffect, useState } from "react";

function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const res = await fetch("https://trcnfx.com/api/messages");
    const data = await res.json();
    setMessages(data);
  };

  const sendReply = async (messageId) => {
    await fetch(`https://trcnfx.com/api/messages/${messageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    });
    setReply("");
    fetchMessages();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {messages.map((msg) => (
        <div key={msg._id}>
          <p>
            <strong>Client Message:</strong> {msg.message}
          </p>
          <p>
            <strong>Reply:</strong> {msg.reply || "No reply yet"}
          </p>
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} />
          <button onClick={() => sendReply(msg._id)}>Send Reply</button>
        </div>
      ))}
    </div>
  );
}

export default AdminContact;
