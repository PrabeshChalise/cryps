import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../wallet/WalletDashboard.css"; // Import the CSS file for styling
import { Sparklines, SparklinesLine } from "react-sparklines"; // Import Sparklines for the graphs
import Login from "./Login"; // Import the Login component
import SignupModal from "./SignupModal"; // Import the SignupModal component
import logo3 from "./logo3.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
export default function TradePage() {
  const url =
    "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true";

  const [info, setInfo] = useState([]);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility
  const [showLoginModal, setShowLoginModal] = useState(false); // State to manage login modal visibility
  const [showSignupModal, setShowSignupModal] = useState(false); // State to manage signup modal visibility
  const navigate = useNavigate();
  const sidebarRef = useRef();
  const uid = localStorage.getItem("_id");
  const userrid = localStorage.getItem("userId");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to manage login status
  const [kycStatus, setKycStatus] = useState(""); // State to manage KYC status
  const [selectedCurrency, setSelectedCurrency] = useState("USD"); // Default to USD
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencySymbols, setCurrencySymbols] = useState({});
  const userId = localStorage.getItem("_id");
  // const formattedBalance = new Intl.NumberFormat("en-US", {
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // }).format(totalUsdBalance * (exchangeRates[selectedCurrency] || 1));
  // const [totalUsdBalance, setTotalUsdBalance] = useState(0);
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        setExchangeRates(response.data.rates);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    };

    fetchExchangeRates();
  }, []);
  useEffect(() => {
    axios
      .get(url, {
        headers: {
          "X-Cg-Pro-Api-Key": "CG-abdEKxm7HXgBnnG2D2eexnmq", // Add your API key here
        },
      })
      .then((response) => {
        setInfo(response.data.filter((crypto) => crypto.symbol !== "usdt")); // Filter out USDT
      });
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current && // Check if sidebarRef is available
        !sidebarRef.current.contains(event.target) && // Ensure click is outside the sidebar
        isMenuOpen // Only close if the menu is open
      ) {
        setIsMenuOpen(false); // Close the sidebar
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, sidebarRef]); // Add sidebarRef to the dependency array
  const [activeFooter, setActiveFooter] = useState("home"); // Default active is 'home'

  const handleFooterClick = (route) => {
    setActiveFooter(route); // Set the clicked footer as active
    handleNavigation(route); // Navigate to the corresponding route
  };
  useEffect(() => {
    // Check if the user is logged in by checking the localStorage for authToken
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }

    const fetchKycStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/kyc/${uid}`
        );
        setKycStatus(response.data.status);
      } catch (error) {
        console.error("Error fetching KYC status:", error);
      }
    };

    if (uid) {
      fetchKycStatus();
    }
  }, [uid]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getGraphIndicator = (sparkline, priceChange) => {
    const color = priceChange >= 0 ? "green" : "red";
    return (
      <Sparklines data={sparkline} svgWidth={100} svgHeight={30}>
        <SparklinesLine color={color} />
      </Sparklines>
    );
  };

  const handleNavigation = (route) => {
    if (isLoggedIn) {
      navigate(route);
    } else {
      setShowLoginModal(true);
    }
  };
  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency");
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);
  const renderKycStatus = () => {
    if (kycStatus === "approved") {
      return (
        <p className="kyc-status">
          Verified{" "}
          <i className="fas fa-check-circle" style={{ color: "white" }}></i>
        </p>
      );
    }
    return null;
  };

  if (info.length === 0) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="container">
        <header>
          <div
            className="title-container"
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              width: "100%",
            }}
          >
            <h1>
              <b style={{ fontSize: "25px" }} className="header-text">
                <Link to="/">TRCNFX</Link>
              </b>
            </h1>

            <button className="menu-button" onClick={toggleMenu}>
              &#9776;
            </button>
          </div>
        </header>

        <Sidebar
          sidebarRef={sidebarRef}
          // email={email}
          userId={userId}
          kycStatus={kycStatus}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          // handleLogout={handleLogout}
        />

        <div className="main-content">
          {/* <div className="market-tabs"> */}
          {/* <button className="active">Trade Portal</button> */}
          {/* </div> */}
          <h1
            style={{
              marginLeft: "10px",
              marginBottom: "20px",
              borderBottom: "2px solid green",
              width: "94px",
            }}
          >
            <b className="labels23">Trade Portal</b>
          </h1>
          <div className="featured-cryptos" style={{ margin: "20px 0" }}>
            {/* <div className="market-tabs">
            <button
              className="active"
              style={{
                marginTop: "10px",
                marginLeft: "5px",
                marginBottom: "10px",
              }}
            >
              Featured Trades
            </button> */}
            {/* </div>{" "} */}
            <div
              className="featured-crypto-list"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              {info.slice(0, 3).map((crypto) => (
                <div
                  key={crypto.id}
                  className="featured-crypto-item"
                  style={{
                    // border: "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "10px",
                    textAlign: "center",
                    width: "30%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    // backgroundColor: "black",
                    borderBottom: "0.5px solid #3e3e3e",
                    borderRight: "0.5px solid #3e3e3e",
                    borderTop: "0.5px solid #3e3e3e",
                  }}
                  onClick={() =>
                    navigate("/trades", { state: { value: crypto } })
                  }
                >
                  <img
                    src={crypto.image}
                    alt={crypto.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      marginBottom: "10px",
                    }}
                  />{" "}
                  <h3>{crypto.symbol.toUpperCase()}</h3>
                  {/* <h3>{crypto.name}</h3> */}
                  <p>
                    {selectedCurrency}{" "}
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(
                      (
                        crypto.current_price *
                        (exchangeRates[selectedCurrency] || 1)
                      ).toFixed(2)
                    )}
                  </p>
                  <p
                    style={{
                      color:
                        crypto.price_change_percentage_24h >= 0
                          ? "green"
                          : "red",
                    }}
                  >
                    {crypto.price_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* <div className="banner">
            <h2>Discover Seamless Crypto Trading</h2>
            <h2>With TRCNFX</h2>
            <p>Where Your Trust is Our Currency</p>
          </div> */}
          {/* <div className="market-tabs">
            <button className="active">Digital Market</button>
          </div> */}
          <div className="market-list">
            {info.map((value, key) => {
              if (key < 20) {
                return (
                  <div
                    key={key}
                    className="market-item"
                    style={{
                      // backgroundColor: "black",
                      borderBottom: "0.5px solid #3e3e3e",
                    }}
                    onClick={() => navigate("/trades", { state: { value } })}
                  >
                    <div className="market-info" style={{ display: "flex" }}>
                      <img
                        src={value.image}
                        alt={`${value.symbol} logo`}
                        style={{
                          width: "24px",
                          height: "24px",
                          marginRight: "10px",
                        }}
                      />
                      <div>
                        <h3>{value.symbol.toUpperCase()} Coin</h3>
                        <p>USDT</p>
                      </div>
                    </div>
                    <div className="market-graph">
                      {getGraphIndicator(
                        value.sparkline_in_7d.price,
                        value.price_change_percentage_24h
                      )}
                    </div>
                    <div className="market-stats">
                      <p>
                        {" "}
                        {selectedCurrency}{" "}
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          (
                            value.current_price *
                            (exchangeRates[selectedCurrency] || 1)
                          ).toFixed(2)
                        )}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          textAlign: "center",
                          alignItems: "center",
                        }}
                      >
                        <p
                          className={
                            value.price_change_percentage_24h < 0
                              ? "negative"
                              : "positive"
                          }
                          style={{ fontSize: "13px", marginRight: "10px" }}
                        >
                          {value.price_change_percentage_24h.toFixed(2)}%
                        </p>
                        <p>24 Hrs</p>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {showCryptoModal && selectedCrypto && (
          <div className="modal" id="crypto-modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowCryptoModal(false)}>
                &times;
              </span>
              <div className="wallet">
                <div className="wallet-header">
                  <h1>{selectedCrypto.name} Wallet</h1>
                </div>
                <div className="wallet-balance">
                  <p>${selectedCrypto.current_price}</p>
                  <p>
                    Available: {selectedCrypto.circulating_supply}{" "}
                    {selectedCrypto.symbol.toUpperCase()}
                  </p>
                  <p>High 24h: ${selectedCrypto.high_24h}</p>
                  <p>Low 24h: ${selectedCrypto.low_24h}</p>
                </div>
                <div className="wallet-qr">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${selectedCrypto.symbol}Address&size=150x150`}
                      alt="QR Code"
                    />
                  </div>
                  <p id="btc-address">3ghadsb893p2lsand</p>
                  <p
                    className="copy-address"
                    onClick={() =>
                      navigator.clipboard.writeText("3ghadsb893p2lsand")
                    }
                  >
                    Copy address
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showLoginModal && (
          <Login closeModal={() => setShowLoginModal(false)} />
        )}

        {showSignupModal && (
          <SignupModal closeModal={() => setShowSignupModal(false)} />
        )}
        <Footer />
      </div>
    );
  }
}
