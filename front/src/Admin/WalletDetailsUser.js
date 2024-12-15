import React, { useEffect, useState } from "react";
import axios from "axios";

// Mapping of symbols to full names
const symbolToFullNameMap = {
  btc: "bitcoin",
  eth: "ethereum",
  bnb: "binancecoin",
  usdc: "usd-coin",
  xrp: "ripple",
  ton: "toncoin",
  ada: "cardano",
  avax: "avalanche",
  bch: "bitcoin-cash",
  dot: "polkadot",
  dai: "dai",
  life: "lifecoin",
  shib: "shiba-inu",
  sol: "solana",
  steth: "lido-staked-ether",
  wbtc: "wrapped-bitcoin",
  link: "chainlink",
  leo: "leo-token",
};

const WalletDetailsUser = ({ selectedUserId }) => {
  const [wallet, setWallet] = useState(null);
  const [prices, setPrices] = useState({});
  const [profitLoss, setProfitLoss] = useState(null);
  const [withdrawals, setWithdrawals] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCoin, setCurrentCoin] = useState(null);
  const [updatedValue, setUpdatedValue] = useState("");

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await axios.get(
          `https://trcnfx.com/api/wallet/${selectedUserId}`
        );
        setWallet(response.data);
      } catch (error) {
        console.error("Error fetching wallet:", error);
      }
    };

    if (selectedUserId) {
      fetchWallet();
    }
  }, [selectedUserId]);

  useEffect(() => {
    const fetchPrices = async (symbols) => {
      try {
        const fullNames = symbols.map(
          (symbol) => symbolToFullNameMap[symbol.toLowerCase()] || symbol
        );
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price`,
          {
            params: {
              ids: fullNames.join(","),
              vs_currencies: "usd",
            },
          }
        );
        setPrices(response.data);
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };

    if (wallet) {
      const symbols = Object.keys(wallet.balances).filter(
        (coin) => wallet.balances[coin] > 0
      );
      if (symbols.length > 0) {
        fetchPrices(symbols);
      }
    }
  }, [wallet]);

  useEffect(() => {
    const fetchProfitLoss = async () => {
      try {
        const response = await axios.get(
          `https://trcnfx.com/api/profit-stats/${selectedUserId}?period=1M`
        );
        const netProfitLoss = response.data.stats.netProfitLoss;
        setProfitLoss(netProfitLoss);
      } catch (error) {
        console.error("Error fetching profit/loss:", error);
        setProfitLoss(0); // Fallback to 0 in case of error
      }
    };

    if (selectedUserId) {
      fetchProfitLoss();
    }
  }, [selectedUserId]);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await axios.get(
          `https://trcnfx.com/api/send1/${selectedUserId}`
        );
        const completedWithdrawals = response.data.filter(
          (send) => send.status === "complete"
        );

        const withdrawalSums = completedWithdrawals.reduce(
          (acc, withdrawal) => {
            const coin = withdrawal.symbol.toLowerCase();
            if (!acc[coin]) {
              acc[coin] = 0;
            }
            acc[coin] += withdrawal.amount;
            return acc;
          },
          {}
        );

        setWithdrawals(withdrawalSums);
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
      }
    };

    if (selectedUserId) {
      fetchWithdrawals();
    }
  }, [selectedUserId]);

  const calculateTotalInvestmentValue = () => {
    if (!wallet || !prices) return 0;
    return Object.entries(wallet.balances).reduce((total, [coin, value]) => {
      const fullName = symbolToFullNameMap[coin.toLowerCase()] || coin;
      return total + (prices[fullName]?.usd || 0) * value;
    }, 0);
  };

  const calculateWithdrawalUSD = (coin) => {
    const fullName = symbolToFullNameMap[coin.toLowerCase()] || coin;
    const withdrawalAmount = withdrawals[coin] || 0;
    return (prices[fullName]?.usd || 0) * withdrawalAmount;
  };

  const openModal = (coin, value) => {
    setCurrentCoin({ coin, value });
    setUpdatedValue(value);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCoin(null);
    setUpdatedValue("");
  };

  const handleUpdateCoinValue = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://trcnfx.com/api/wallet3", {
        userId: selectedUserId,
        symbol: currentCoin.coin.toLowerCase(),
        amount: parseFloat(updatedValue),
      });
      // Refetch wallet after update
      const response = await axios.get(
        `https://trcnfx.com/api/wallet/${selectedUserId}`
      );
      setWallet(response.data);
      closeModal();
    } catch (error) {
      console.error("Error updating coin value:", error);
    }
  };

  const renderWalletDetails = () => {
    if (!wallet) return null;

    // Filter out USD balance from being displayed
    const filteredBalances = Object.entries(wallet.balances).filter(
      ([coin, value]) => value > 0 && coin.toLowerCase() !== "usd"
    );

    if (filteredBalances.length === 0) {
      return (
        <tr>
          <td colSpan="7" style={{ padding: "10px", border: "1px solid #ccc" }}>
            No assets to display
          </td>
        </tr>
      );
    }

    const totalInvestmentValue = calculateTotalInvestmentValue();

    return (
      <>
        {filteredBalances.map(([coin, value]) => {
          const fullName = symbolToFullNameMap[coin.toLowerCase()] || coin;
          return (
            <tr key={coin}>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {coin.toUpperCase()}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {value}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {(prices[fullName]?.usd || 0) * value}
              </td>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  color: profitLoss > 0 ? "green" : "red",
                }}
              >
                {profitLoss !== null ? profitLoss.toFixed(2) : "N/A"}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {calculateWithdrawalUSD(coin).toFixed(2)}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                <button
                  className="bg-blue-500 text-white py-1 px-3 rounded"
                  onClick={() => openModal(coin, value)}
                >
                  Update
                </button>
              </td>
            </tr>
          );
        })}
        <tr>
          <td style={{ padding: "10px", border: "1px solid #ccc" }}>Total</td>
          <td style={{ padding: "10px", border: "1px solid #ccc" }}></td>
          <td style={{ padding: "10px", border: "1px solid #ccc" }}>
            {totalInvestmentValue}
          </td>
          <td
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              color: profitLoss > 0 ? "green" : "red",
            }}
          >
            {profitLoss !== null ? profitLoss.toFixed(2) : "N/A"}
          </td>
          <td style={{ padding: "10px", border: "1px solid #ccc" }}>
            {Object.entries(withdrawals)
              .reduce((sum, [coin]) => sum + calculateWithdrawalUSD(coin), 0)
              .toFixed(2)}
          </td>
        </tr>
      </>
    );
  };

  if (!selectedUserId) {
    return null; // Don't render anything if no user is selected
  }

  return (
    <div className="wallet-details p-4">
      <h2 className="text-2xl font-bold mb-4">Wallet Details for User</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th
                style={{ padding: "10px", border: "1px solid #ccc" }}
                className="py-3 px-6 text-left"
              >
                Coin
              </th>
              <th
                style={{ padding: "10px", border: "1px solid #ccc" }}
                className="py-3 px-6 text-left"
              >
                Coin Value
              </th>
              <th
                style={{ padding: "10px", border: "1px solid #ccc" }}
                className="py-3 px-6 text-left"
              >
                USD Value of Capital Investment
              </th>
              <th
                style={{ padding: "10px", border: "1px solid #ccc" }}
                className="py-3 px-6 text-left"
              >
                Profit/Loss
              </th>
              <th
                style={{ padding: "10px", border: "1px solid #ccc" }}
                className="py-3 px-6 text-left"
              >
                Withdraw
              </th>
              <th
                style={{ padding: "10px", border: "1px solid #ccc" }}
                className="py-3 px-6 text-left"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {renderWalletDetails()}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Update {currentCoin.coin.toUpperCase()} Value</h3>
            <form onSubmit={handleUpdateCoinValue}>
              <div className="form-group">
                <label htmlFor="updatedValue">Coin Value:</label>
                <input
                  type="number"
                  id="updatedValue"
                  value={updatedValue}
                  onChange={(e) => setUpdatedValue(e.target.value)}
                  step="0.0001"
                  required
                />
              </div>
              <button
                type="submit"
                className="submit-button"
                style={{ backgroundColor: "green", color: "white" }}
              >
                Update
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={closeModal}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminTradeControl = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered users
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const adminId = localStorage.getItem("adminId"); // Assuming adminId is stored in localStorage

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch clients based on admin's team
        const usersResponse = await axios.get(
          `https://trcnfx.com/api/clients-by-admin/${adminId}`
        );
        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data); // Initialize filteredUsers
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (adminId) {
      fetchUsers();
    }
  }, [adminId]);

  const handleSearch = () => {
    const filtered = users.filter((user) =>
      user.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleViewWalletDetails = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="admin-trade-control p-4">
      <h2 className="text-2xl font-bold mb-4">Client List</h2>
      <div className="mb-4">
        <div style={{ display: "flex" }}>
          <input
            style={{ width: "500px" }}
            type="text"
            placeholder="Search by User ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded px-4 py-2 mr-2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th
                style={{ padding: "10px", border: "1px solid #ccc" }}
                className="py-3 px-6 text-left"
              >
                User ID
              </th>
              <th
                style={{ padding: "10px", border: "1px solid #ccc" }}
                className="py-3 px-6 text-left"
              >
                Email
              </th>
              <th
                style={{ padding: "10px", border: "1px solid #ccc" }}
                className="py-3 px-6 text-left"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td
                  style={{ padding: "10px", border: "1px solid #ccc" }}
                  className="py-3 px-6 text-left whitespace-nowrap"
                >
                  {user.userId}
                </td>
                <td
                  style={{ padding: "10px", border: "1px solid #ccc" }}
                  className="py-3 px-6 text-left whitespace-nowrap"
                >
                  {user.email}
                </td>
                <td
                  style={{ padding: "10px", border: "1px solid #ccc" }}
                  className="py-3 px-6 text-left"
                >
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                    onClick={() => handleViewWalletDetails(user._id)}
                  >
                    View Wallet Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUserId && <WalletDetailsUser selectedUserId={selectedUserId} />}
    </div>
  );
};

export default AdminTradeControl;
