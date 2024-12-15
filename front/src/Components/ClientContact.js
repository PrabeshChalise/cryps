import React, { useState } from "react";

function ClientContact() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(null);

  const sendMessage = async () => {
    const res = await fetch("https://trcnxf.com/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: "client1", message }),
    });
    if (res.ok) setMessage("");
  };

  const fetchReply = async () => {
    const res = await fetch("https://trcnxf.com/api/messages");
    const messages = await res.json();
    const clientMessage = messages.find((msg) => msg.clientId === "client1");
    if (clientMessage) setResponse(clientMessage.reply);
  };

  return (
    <div>
      <h2>Contact Us</h2>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      {response && <p>Admin Reply: {response}</p>}
    </div>
  );
}

export default ClientContact;
