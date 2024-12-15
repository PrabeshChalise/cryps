import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Countdown from "./Countdown";
import "./PredictionSummary.css";

const cryptoNameToSymbol = {
  ethereum: "ETH",
  bitcoin: "BTC",
  // Add more mappings as needed
};

const PredictionSummary = ({ prediction, showResult }) => {
  const navigate = useNavigate();
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const symbol = prediction.symbol.toLowerCase();
        const logoResponse = await axios.get(
          `https://pro-api.coingecko.com/api/v3/coins/${symbol}`,
          {
            headers: {
              "X-Cg-Pro-Api-Key": "CG-abdEKxm7HXgBnnG2D2eexnmq",
            },
          }
        );
        console.log("symbol for logo:", symbol);

        const imageUrl = logoResponse.data.image.large;
        const imageResponse = await axios.get(
          "https://trcnxf.com/api/fetch-image",
          {
            params: { imageUrl },
          }
        );
        setLogoBase64(`data:image/jpeg;base64,${imageResponse.data.image}`);
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, [prediction.symbol]);

  const handleNavigateToDetails = () => {
    if (showResult) {
      navigate(`/prediction/${prediction._id}`);
    }
  };

  const isProfit = prediction.result && prediction.result.success;
  const profitLossAmount = prediction.result ? prediction.result.profit : 0;

  const profitLossClass = isProfit ? "profit" : "loss";
  const profitLossIcon = isProfit ? "↑" : "↓";
  const profitLossMessage = prediction.result
    ? isProfit
      ? `You have won ${profitLossAmount} USD`
      : `You have lost all your money`
    : "Pending";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
        alignItems: "center",
      }}
    >
      <div
        className="prediction-summary"
        onClick={handleNavigateToDetails}
        style={{
          width: "90%",
          // backgroundColor: "black",
          borderBottom: "0.5px solid #3e3e3e",
          // backgroundColor: "#222e35",
          // backgroundColor: "#f0f0f0be",
          cursor: showResult ? "pointer" : "default",
        }}
      >
        <div className="summary-header">
          <div style={{ marginLeft: "30px" }}>
            <img
              style={{ height: "30px", width: "30px" }}
              src={logoBase64}
              alt={`${prediction.symbol} logo`}
              className="logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/50";
              }}
            />
            <h1 className="labels23" style={{ fontSize: "13px" }}>
              {prediction.symbol.toUpperCase()}
            </h1>
          </div>
          <div style={{ marginRight: "30px" }}>
            <p style={{ fontSize: "12px" }}>
              {new Date(prediction.predictedAt).toLocaleString()}
            </p>
            {showResult && prediction.result ? (
              <p
                className={`profit-loss ${profitLossClass}`}
                style={{ fontSize: "12px" }}
              >
                {profitLossIcon}{" "}
                {isProfit ? (
                  <span>{profitLossAmount}</span>
                ) : (
                  <span className="loss-amount">{prediction.amount}</span>
                )}
              </p>
            ) : (
              <p className="pending">Pending</p>
            )}
            {!showResult && (
              <p>
                Time Left:{" "}
                <Countdown
                  deliveryTime={prediction.deliveryTime}
                  predictedAt={prediction.predictedAt}
                />
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionSummary;
