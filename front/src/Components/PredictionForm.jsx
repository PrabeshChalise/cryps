import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import CryptoChart from "./CryptoChart";
import "../wallet/WalletDashboard.css"; // Import the CSS file for styling
import Login from "./Login"; // Import the Login component
import SignupModal from "./SignupModal"; // Import the SignupModal component
import resultimg from "./result.png";
import logo3 from "./logo3.png";
import usdtImg from "./usdtImg.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Sidebar from "./Sidebar";
const PredictionForm = () => {
  const [direction, setDirection] = useState("up");
  const [amount, setAmount] = useState("");
  const [deliveryTime, setDeliveryTime] = useState(60);
  const [predictionId, setPredictionId] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [interest, setInterest] = useState(0); // State to hold interest rate
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to manage login status
  const [showLoginModal, setShowLoginModal] = useState(false); // State to manage login modal visibility
  const [showSignupModal, setShowSignupModal] = useState(false); // State to manage signup modal visibility
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location || {};
  const { value } = state || {};
  const walletAddress = localStorage.getItem("walletAddress");
  const sidebarRef = useRef();
  const uid = localStorage.getItem("userId");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State for success popup
  const [modalIconColor, setModalIconColor] = useState("green"); // green for success, red for error
  const [modalMessage, setModalMessage] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const userId = localStorage.getItem("_id");
  const [kycStatus, setKycStatus] = useState(""); // State to manage KYC status

  // Delivery times with interest rates and minimum amounts
  const deliveryTimes = [
    { time: 60, interest: 0.1, minAmount: 50 },
    { time: 120, interest: 0.35, minAmount: 1000 },
    { time: 129600, interest: 2.15, minAmount: 50000 },
    { time: 604800, interest: 3.15, minAmount: 100000 },
    { time: 2592000, interest: 5.2, minAmount: 200000 },
  ];
  const [sliderValue, setSliderValue] = useState(0); // Slider for percentage

  const formatDeliveryTime = (seconds) => {
    const days = seconds / 86400;
    if (days >= 1 && Number.isInteger(days)) return `${days}D`;
    if (days >= 1) return `${Math.floor(seconds / 3600)}H`; // Shows integer hours if days is not a whole number
    if (seconds >= 3600) return `${seconds / 3600}H`;
    // if (seconds >= 60) return `${seconds / 60} m`;
    return `${seconds}S`;
  };
  useEffect(() => {
    // Check if the user is logged in by checking the localStorage for authToken
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }

    const fetchKycStatus = async () => {
      try {
        const response = await axios.get(`https://trcnfx.com/api/kyc/${uid}`);
        setKycStatus(response.data.status);
      } catch (error) {
        console.error("Error fetching KYC status:", error);
      }
    };

    if (uid) {
      fetchKycStatus();
    }
  }, [uid]);

  // Calculate and update interest when deliveryTime changes
  useEffect(() => {
    const selectedTime = deliveryTimes.find(
      (dt) => dt.time === Number(deliveryTime)
    );
    if (selectedTime) {
      setInterest(selectedTime.interest);
    }
  }, [deliveryTime]);
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        console.log(userId);
        const response = await axios.get(
          `https://trcnfx.com/api/wallet/${userId}`
        );
        setWalletBalance(response.data.balances.tether); // Assuming USD balance is stored under "usd"
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchWalletBalance();
  }, [userId]);

  useEffect(() => {
    // Check if the user is logged in by checking the localStorage for authToken
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }
  }, []);

  // Effect to handle submitting prediction and fetching result
  useEffect(() => {
    if (predictionId) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `https://trcnfx.com/api/prediction/${predictionId}`
          );
          if (response.data) {
            setResult(response.data);
            clearInterval(interval); // Stop checking after getting the result
          }
        } catch (error) {
          console.error("Error fetching prediction result:", error);
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [predictionId]);
  const handleNavigation = (route) => {
    if (isLoggedIn) {
      navigate(route);
    } else {
      setShowLoginModal(true);
    }
  };
  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const userId = localStorage.getItem("_id");
    const walletAddress = localStorage.getItem("walletAddress");
    const uid = localStorage.getItem("userId"); // Get the uid here
    console.log(uid);
    try {
      const priceResponse = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            ids: value.id,
            order: "market_cap_desc",
            per_page: 1,
            page: 1,
            sparkline: false,
          },
        }
      );
      const currentPrice = priceResponse.data[0].current_price;

      const response = await axios.post("https://trcnfx.com/api/predict", {
        symbol: value.id,
        direction,
        amount: Number(amount),
        deliveryTime,
        currentPrice,
        uid, // Pass uid here
        userId,
        walletAddress,
      });
      setPredictionId(response.data._id);
      setModalMessage("Order Submitted");
      setModalIconColor("green"); // Success color
      setShowSuccessPopup(true); // Show success popup

      // Reset amount and slider value
      setAmount(""); // Clear the amount field
      setSliderValue(0); // Reset slider to 0%
      closeModal(); // Close the modal after submission
    } catch (error) {
      console.error("Error submitting prediction:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setModalMessage(error.response.data.error); // Display the error message
        setModalIconColor("red"); // Error color
        setShowSuccessPopup(true); // Show error popup
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to close the modal
  const closeModal = () => setShowModal(false);
  const handleMaxClick = () => {
    setAmount(walletBalance);
  };

  // Function to open the modal
  const openModal = () => setShowModal(true);

  // Function to toggle the sidebar menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleProtectedAction = (action) => {
    if (isLoggedIn) {
      action();
    } else {
      setShowLoginModal(true);
    }
  };

  // Retrieve selected delivery time details
  const selectedTime = deliveryTimes.find(
    (dt) => dt.time === Number(deliveryTime)
  );

  // Handle clicks outside the sidebar to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="container">
      <header style={{ borderRadius: "0px" }}>
        <div
          className="title-container"
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            borderRadius: "0px",
          }}
        >
          <button
            className="back-button"
            onClick={() => navigate(-1)}
            style={{
              marginRight: "10px",
              fontSize: "24px",
              background: "none",
              border: "none",
              cursor: "pointer",
              // color: "white",
            }}
          >
            &#8592;
          </button>
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
        // email={email}
        sidebarRef={sidebarRef}
        userId={userId}
        kycStatus={kycStatus}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        // handleLogout={handleLogout}
      />

      <div className="main-content">
        <div
          className="button-container"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            width: "100%",
          }}
        >
          <button
            className="fa-solid fa-square-poll-vertical fa-2x"
            onClick={() => handleProtectedAction(() => navigate("/result"))}
            style={{
              color: "#7d9aea",
              cursor: "pointer",
            }}
          ></button>
        </div>

        <div
          id="predict-chart"
          className="w-[100%] mx-auto bg-[#1b202d] p-6 items-center"
          style={{
            // color: "black",
            // backgroundColor: "white",
            margin: 0,
            padding: 0,
          }}
        >
          <div className="chart-container" style={{ margin: 0, padding: 0 }}>
            <CryptoChart symbol={value?.id} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              alignItems: "center",
            }}
          >
            {" "}
            <button
              className="text-white font-bold py-2 px-4 rounded mb-4"
              onClick={() => handleProtectedAction(openModal)}
              style={{
                width: "300px",
                height: "50px",
                marginTop: "30px",
                // background: "linear-gradient(to right, #4caf50, #81c784)",
                background: "#7d9aea",
              }}
            >
              Trade Now
            </button>
          </div>
        </div>
      </div>
      {showSuccessPopup && (
        <div
          className="modal show"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            // backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: "1000",
          }}
        >
          <div
            className="modal-content5"
            style={{
              // backgroundColor: "#fefefe",
              margin: "5% auto",
              padding: "20px",
              border: "1px solid #888",
              width: "80%",
              maxWidth: "400px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
            }}
          >
            {/* <span
              className="close"
              onClick={() => setShowSuccessPopup(false)}
              style={{
                color: "#aaa",
                float: "right",
                fontSize: "28px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              &times;
            </span> */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                className="success-animation"
                style={{ marginBottom: "20px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={modalIconColor} // Use the modalIconColor
                  width="80px"
                  height="80px"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12s12-5.37 12-12C24 5.37 18.63 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM10 17.2l-5.3-5.3 1.4-1.4 3.9 3.9 7.9-7.9 1.4 1.4L10 17.2z" />
                  {modalIconColor === "red" && ( // If error, show cross icon
                    <path
                      d="M15.41 8.59L12 12l-3.41-3.41L7 10l5 5 5-5z"
                      fill="red"
                    />
                  )}
                </svg>
              </div>
            </div>
            <h2 className="header-text">{modalMessage}</h2>
            <p>{modalIconColor === "green" ? "" : ""}</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                background: "linear-gradient(to right, #4caf50, #81c784)",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                marginTop: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div
          id="entrustModal"
          className="modal show"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            // backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            id="modalBack"
            className="modal-content"
            style={{
              // backgroundColor: "#f4f4f6",
              margin: "5% auto",
              padding: "10px 30px 10px 30px",
              border: "1px solid #888",
              width: "90%",
              maxWidth: "500px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              marginTop: "80px",
            }}
          >
            <span
              className="close"
              onClick={closeModal}
              style={{
                color: "#aaa",
                float: "right",
                fontSize: "28px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              &times;
            </span>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
                alignItems: "center",
              }}
            >
              {" "}
              <h1
                className="main-balance-text"
                style={{
                  // color: "white",
                  fontSize: "18px",
                  marginBottom: "10px",
                  borderBottom: "2px solid #7d9aea",
                }}
              >
                <b className="main-balance-text">
                  {" "}
                  {value.symbol.toUpperCase()} Coin Delivery
                </b>
              </h1>
            </div>
            <div style={{ display: "flex" }}>
              <div>
                <div style={{ display: "flex" }}>
                  <img
                    src={value.image}
                    alt={value.symbol}
                    style={{
                      width: "30px",
                      height: "30px",
                      marginRight: "10px",
                    }}
                  />
                  <p className="main-balance-text">
                    {value?.symbol.toUpperCase()} / USDT
                  </p>
                </div>{" "}
                <div
                  style={{
                    marginLeft: "40px",
                    marginTop: "5px",
                    marginBottom: "5px",
                  }}
                >
                  {direction === "up" && (
                    <h4
                      style={{
                        color: "white",
                        backgroundColor: "green",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        marginBottom: "5px",
                        border: "1px solid white",
                      }}
                    >
                      <b>Buy / Long</b>
                    </h4>
                  )}
                  {direction === "down" && (
                    <h4
                      style={{
                        color: "white",
                        backgroundColor: "red",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        marginBottom: "5px",
                        border: "1px solid white",
                      }}
                    >
                      <b>Sell / Short</b>
                    </h4>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <label
                  className="labels23"
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    // color: "white",
                    marginTop: "5px",
                  }}
                >
                  Delivery Time
                </label>
                <select
                  id="select1"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(Number(e.target.value))}
                  style={{
                    width: "100%",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    boxSizing: "border-box",
                    fontSize: "14px", // Reduced font size
                    // color: "white",
                    // backgroundColor: "black",
                    height: "30px", // Height of the input field
                    padding: "5px 10px", // Top padding pushes the text
                    lineHeight: "16px", // Match the font size for alignment at the top
                    overflow: "hidden",
                    textAlign: "left",
                    display: "block",
                  }}
                >
                  {deliveryTimes.map((dt) => (
                    <option
                      key={dt.time}
                      value={dt.time}
                      style={{
                        textAlign: "center",
                      }}
                    >
                      {formatDeliveryTime(dt.time)}
                    </option>
                  ))}
                </select>

                <label
                  className="labels23"
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    // color: "white",
                  }}
                >
                  Direction
                </label>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setDirection("up")}
                    className={`direction-button ${
                      direction === "up" ? "green" : "black"
                    }`}
                  >
                    Bullish
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("down")}
                    className={`direction-button ${
                      direction === "down" ? "red" : "black"
                    }`}
                    style={{
                      marginLeft: "5px",
                    }} /* Add margin-left for the second button */
                  >
                    Bearish
                  </button>
                </div>
                <label
                  className="labels23"
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    // color: "white",
                  }}
                >
                  Amount
                </label>
                <div style={{ display: "flex" }}>
                  <div
                    className="usdtIconss"
                    style={{
                      display: "flex",
                      width: "140px",
                      padding: "5px",
                      marginBottom: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      boxSizing: "border-box",
                      fontSize: "16px",
                      marginRight: "20px",
                      // backgroundColor: "black",
                      height: "35px",
                    }}
                  >
                    <img
                      src={usdtImg}
                      alt="image"
                      style={{ width: "20px", height: "20px" }}
                    />
                    <p
                      className="main-balance-text"
                      style={{ fontSize: "15px" }}
                    >
                      USDT
                    </p>
                  </div>

                  <input
                    className="select11"
                    type="number"
                    step="0.01" // Allow up to 2 decimal places
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (value === "") {
                        setAmount("");
                        setSliderValue(0); // Reset slider value
                        return;
                      }

                      const numericValue = parseFloat(value);
                      if (!isNaN(numericValue) && walletBalance > 0) {
                        const limitedDecimals = Math.min(
                          Math.max(numericValue, 0),
                          walletBalance
                        ); // Restrict to 2 decimal places
                        setAmount(limitedDecimals);

                        const percentage = Math.min(
                          (limitedDecimals / walletBalance) * 100,
                          100
                        ).toFixed(2); // Restrict percentage to 2 decimals
                        setSliderValue(percentage);
                      }
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "5px",
                      marginBottom: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      boxSizing: "border-box",
                      fontSize: "16px",
                      height: "35px",
                      textAlign: "center",
                    }}
                  />

                  <button
                    className="labels23"
                    type="button"
                    onClick={handleMaxClick}
                    style={{ marginLeft: "10px" }}
                  >
                    Max
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={sliderValue}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setSliderValue(value);

                      if (walletBalance > 0) {
                        const calculatedAmount = (
                          (value / 100) *
                          walletBalance
                        ).toFixed(2); // Restrict amount to 2 decimal places
                        setAmount(calculatedAmount);
                      }
                    }}
                    style={{
                      border: "none",
                      width: "100%",
                      marginTop: "10px",
                      appearance: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  />
                  <style>
                    {`
    input[type="range"]::-webkit-slider-runnable-track {
      width: 100%;
      height: 3px; /* Reduced height for the slider track */
      background: linear-gradient(to right, #bed0f6 0%, #5358d5 100%);
      border-radius: 2px;
    }

    input[type="range"]::-moz-range-track {
      width: 100%;
      height: 3px; /* Reduced height for the slider track */
      background: linear-gradient(to right, #bed0f6 0%, #5358d5 100%);
      border-radius: 2px;
    }

    input[type="range"]::-ms-track {
      width: 100%;
      height: 3px; /* Reduced height for the slider track */
      background: linear-gradient(to right, #bed0f6 0%, #5358d5 100%);
      border-radius: 2px;
      color: transparent;
    }

    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 15px; /* Smaller thumb width */
      height: 15px; /* Smaller thumb height */
      background: #0008ff;
      border-radius: 50%;
      cursor: pointer;
      margin-top: -6px; /* Adjust for alignment */
    }

    input[type="range"]::-moz-range-thumb {
      width: 15px; /* Smaller thumb width */
      height: 15px; /* Smaller thumb height */
      background: #0008ff;
      border-radius: 50%;
      cursor: pointer;
    }

    input[type="range"]::-ms-thumb {
      width: 15px; /* Smaller thumb width */
      height: 15px; /* Smaller thumb height */
      background: #0008ff;
      border-radius: 50%;
      cursor: pointer;
    }
  `}
                  </style>

                  <p style={{ marginLeft: "5px" }}>{sliderValue}%</p>
                </div>

                {/* <div
                  style={{
                    textAlign: "right",
                    color: "white",
                    marginTop: "5px",
                  }}
                >
                  
                </div> */}
                <label
                  className="labels23"
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    // color: "white",
                  }}
                >
                  Rate of Return
                </label>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <input
                    className="select11"
                    type="text"
                    value={`${interest * 100}%`}
                    readOnly
                    style={{
                      // color: "white",
                      width: "70%",
                      padding: "5px", // Reduced padding for smaller height
                      marginBottom: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      boxSizing: "border-box",
                      fontSize: "14px", // Optional: reduce font size to fit smaller height
                      display: "flex",
                      justifyContent: "center",
                      textAlign: "center",
                      alignItems: "center",
                      // color: "black",
                      // backgroundColor:""
                      // backgroundColor: "black",
                      height: "35px", // Reduced height
                    }}
                  />
                </div>
                <div className="mt-4" style={{ marginTop: "10px" }}>
                  <p className="labels23">Fee: {amount * 0.001} USDT</p>
                  <p className="labels23">
                    Minimum Amount: {selectedTime?.minAmount} USDT
                  </p>
                </div>
                <div className="mt-4" style={{ marginTop: "10px" }}>
                  <button
                    type="submit"
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "5px",
                      background: "#7d9aea",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "16px",
                      marginTop: "10px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} />}

      {showSignupModal && (
        <SignupModal closeModal={() => setShowSignupModal(false)} />
      )}
      <div
        className="footer-nav"
        style={{ display: showModal ? "none" : "block" }}
      >
        <ul className="footer-icons">
          <li
            onClick={() => handleNavigation("/")}
            style={{ marginLeft: "10px" }}
          >
            <i className="fas fa-home"></i>
            <span>Home</span>
          </li>
          <li onClick={() => handleNavigation("/tradepage")}>
            <i className="fas fa-exchange-alt"></i>
            <span>Trade</span>
          </li>
          <li onClick={() => handleNavigation("/result")}>
            <i className="fas fa-chart-line"></i>
            <span>Result</span>
          </li>
          <li
            onClick={() => handleNavigation("/wallet")}
            style={{ marginRight: "10px" }}
          >
            <i className="fas fa-wallet"></i>
            <span>Wallet</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PredictionForm;
