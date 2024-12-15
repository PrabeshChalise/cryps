import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

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

const WalletDetails = () => {
  const { userId } = useParams(); // Get userId from URL params
  const [wallet, setWallet] = useState(null);
  const [prices, setPrices] = useState({});
  const [profitLoss, setProfitLoss] = useState(null);
  const [withdrawals, setWithdrawals] = useState({});

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const walletResponse = await axios.get(
          `https://trcnfx.com/api/wallet/${userId}`
        );
        const userResponse = await axios.get(
          `https://trcnfx.com/api/agent-uid-by-user-id/${userId}`
        );
        setWallet({
          ...walletResponse.data,
          agentUID: userResponse.data.agentUID,
        });
      } catch (error) {
        console.error("Error fetching wallet:", error);
      }
    };

    if (userId) {
      fetchWallet();
    }
  }, [userId]);

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
          `https://trcnfx.com/api/profit-stats/${userId}?period=1M`
        );
        const netProfitLoss = response.data.stats.netProfitLoss;
        setProfitLoss(netProfitLoss);
      } catch (error) {
        console.error("Error fetching profit/loss:", error);
        setProfitLoss(0); // Fallback to 0 in case of error
      }
    };

    if (userId) {
      fetchProfitLoss();
    }
  }, [userId]);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await axios.get(
          `https://trcnfx.com/api/send1/${userId}`
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

    if (userId) {
      fetchWithdrawals();
    }
  }, [userId]);

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

  const renderWalletDetails = () => {
    if (!wallet) return null;

    const filteredBalances = Object.entries(wallet.balances).filter(
      ([coin, value]) => value > 0
    );

    if (filteredBalances.length === 0) {
      return (
        <tr>
          <td colSpan="6" style={{ padding: "10px", border: "1px solid #ccc" }}>
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
                {wallet.agentUID || "Not assigned"}
              </td>
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
            </tr>
          );
        })}
        <tr>
          <td style={{ padding: "10px", border: "1px solid #ccc" }}>Total</td>
          <td style={{ padding: "10px", border: "1px solid #ccc" }}></td>
          <td style={{ padding: "10px", border: "1px solid #ccc" }}>
            {totalInvestmentValue.toFixed(2)}
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

  return (
    <div className="wallet-details p-4">
      <h2 className="text-2xl font-bold mb-4">Wallet Details for User</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Agent ID
              </th>

              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Coin
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Coin Value
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                USD Value of Capital Investment
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Profit/Loss
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Withdraw
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {renderWalletDetails()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WalletDetails;
