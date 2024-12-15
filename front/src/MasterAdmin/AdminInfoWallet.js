import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminWalletInfo.css";

const AdminInfoWallet = () => {
  const [cryptos, setCryptos] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [message, setMessage] = useState("");
  const [cryptoName, setCryptoName] = useState("");
  const [walletInfos, setWalletInfos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);

  const cryptoFullNames = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    BNB: "Binancecoin",
    USDC: "USD-COIN",
    // Add other cryptocurrencies here
  };

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await axios.get("https://trcnfx.com/api/cryptos");
        setCryptos(response.data);
      } catch (error) {
        console.error("Error fetching cryptos:", error);
      }
    };

    const fetchWalletInfos = async () => {
      try {
        const response = await axios.get("https://trcnfx.com/api/wallet-info");
        setWalletInfos(response.data);
      } catch (error) {
        console.error("Error fetching wallet infos:", error);
      }
    };

    fetchCryptos();
    fetchWalletInfos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSymbol || !walletAddress || !qrCode) {
      setMessage("Please fill in all fields and upload a QR code.");
      return;
    }

    const formData = new FormData();
    formData.append("symbol", cryptoName.toUpperCase());
    formData.append("walletAddress", walletAddress);
    formData.append("qrCode", qrCode);
    formData.append("cryptoName", selectedSymbol);

    try {
      const response = await axios.post(
        "https://trcnfx.com/api/wallet-info/upload",
        formData
      );
      setMessage(response.data.message);
      setShowForm(false);
      setWalletInfos([...walletInfos, response.data.walletInfo]); // Update state
    } catch (error) {
      console.error("Error uploading wallet info:", error);
      setMessage("Failed to upload wallet info.");
    }
  };

  const handleCryptoChange = (e) => {
    const selectedSymbol = e.target.value;
    const selectedCrypto = cryptos.find(
      (crypto) => crypto.symbol === selectedSymbol
    );
    setSelectedSymbol(selectedSymbol);
    setCryptoName(
      cryptoFullNames[selectedSymbol] || selectedCrypto?.name || ""
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://trcnfx.com/api/wallet-info/${id}`);
      setWalletInfos(walletInfos.filter((wallet) => wallet._id !== id));
    } catch (error) {
      console.error("Error deleting wallet info:", error);
    }
  };

  const handleEdit = (wallet) => {
    setSelectedSymbol(wallet.symbol);
    setWalletAddress(wallet.walletAddress);
    setCryptoName(wallet.cryptoName);
    setQrCode(null); // Reset the QR code file input
    setEditingWallet(wallet);
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedSymbol || !walletAddress || !qrCode) {
      setMessage("Please fill in all fields and upload a QR code.");
      return;
    }

    const formData = new FormData();
    formData.append("symbol", cryptoName.toUpperCase());
    formData.append("walletAddress", walletAddress);
    formData.append("qrCode", qrCode);
    formData.append("cryptoName", selectedSymbol);

    try {
      const response = await axios.put(
        `https://trcnfx.com/api/wallet-info/${editingWallet._id}`,
        formData
      );
      setMessage(response.data.message);
      setShowForm(false);
      setWalletInfos(
        walletInfos.map((wallet) =>
          wallet._id === editingWallet._id ? response.data.walletInfo : wallet
        )
      );
      setEditingWallet(null);
    } catch (error) {
      console.error("Error updating wallet info:", error);
      setMessage("Failed to update wallet info.");
    }
  };

  return (
    <div className="admin-wallet-info">
      <h1 style={{ color: "black" }}>Admin Wallet Info</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Hide Form" : "Add Wallet"}
      </button>

      {showForm && (
        <form onSubmit={editingWallet ? handleUpdate : handleSubmit}>
          <div className="form-group">
            <label>Select Cryptocurrency</label>
            <select
              value={selectedSymbol}
              onChange={handleCryptoChange}
              required
            >
              <option value="">Select...</option>
              {cryptos.map((crypto) => (
                <option key={crypto.id} value={crypto.symbol}>
                  {cryptoFullNames[crypto.symbol] || crypto.name} (
                  {crypto.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Upload QR Code</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setQrCode(e.target.files[0])}
              required
            />
          </div>
          <button type="submit">{editingWallet ? "Update" : "Submit"}</button>
        </form>
      )}

      {message && <p>{message}</p>}

      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-2">Symbol</th>
            <th className="py-2">Wallet Address</th>
            <th className="py-2">QR Code</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {walletInfos.length > 0 &&
            walletInfos.map((wallet) => (
              <tr key={wallet?._id || Math.random()}>
                <td className="border px-4 py-2">
                  {wallet && wallet.symbol ? wallet.symbol : "N/A"}
                </td>
                <td className="border px-4 py-2">
                  {wallet && wallet.walletAddress
                    ? wallet.walletAddress
                    : "N/A"}
                </td>
                <td className="border px-4 py-2">
                  {wallet && wallet.qrCodeUrl ? (
                    <img
                      src={wallet.qrCodeUrl}
                      alt="QR Code"
                      style={{ width: "50px", height: "50px" }}
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  {/* <button
                    onClick={() => handleDelete(wallet?._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button> */}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminInfoWallet;
