import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PredictionSummary from "./PredictionSummary";
import "../wallet/WalletDashboard.css";
import { Link } from "react-router-dom";
import Login from "./Login"; // Import the Login component
import SignupModal from "./SignupModal"; // Import the SignupModal component
import "@fortawesome/fontawesome-free/css/all.min.css";
import logo3 from "./logo3.png";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
const Result = () => {
  const [predictions, setPredictions] = useState([]);
  const [logos, setLogos] = useState({});
  const [selectedTab, setSelectedTab] = useState("wait");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userId = localStorage.getItem("_id");
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false); // State to manage login modal visibility
  const [showSignupModal, setShowSignupModal] = useState(false); // State to manage signup modal visibility
  const sidebarRef = useRef();
  const uid = localStorage.getItem("userId");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to manage login status
  const [kycStatus, setKycStatus] = useState(""); // State to manage KYC status
  const id1 = localStorage.getItem("_id");
  const [email, setEmail] = useState(""); // State to hold the email

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/predictions/user/${userId}`
        );
        console.log("Fetched predictions:", response.data);
        const sortedPredictions = response.data.sort(
          (a, b) => new Date(b.predictedAt) - new Date(a.predictedAt)
        );
        setPredictions(sortedPredictions);
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    };

    fetchPredictions();
  }, [userId]);

  useEffect(() => {
    // Check if the user is logged in by checking the localStorage for authToken
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/kyc/${id1}`
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
  const handleNavigation = (route) => {
    if (isLoggedIn) {
      navigate(route);
    } else {
      setShowLoginModal(true);
    }
  };
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await axios.get(
          "https://pro-api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 250,
              page: 1,
              sparkline: false,
            },
            headers: {
              "X-Cg-Pro-Api-Key": "CG-abdEKxm7HXgBnnG2D2eexnmq",
            },
          }
        );
        const logoMap = {};
        for (const coin of response.data) {
          const imageUrl = coin.image;
          const imageResponse = await axios.get(
            "http://localhost:3001/api/fetch-image",
            {
              params: { imageUrl },
            }
          );
          logoMap[
            coin.symbol.toLowerCase()
          ] = `data:image/jpeg;base64,${imageResponse.data.image}`;
        }
        setLogos(logoMap);
      } catch (error) {
        console.error("Error fetching logos:", error);
      }
    };

    fetchLogos();
  }, []);
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/users/${uid}`
        );
        setEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching email:", error);
      }
    };

    if (uid) {
      fetchEmail();
    }
  }, [uid]);
  const handleLogout = () => {
    // Clear user-related data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("_id");
    localStorage.removeItem("userId");
    localStorage.removeItem("selectedCurrency");

    // Redirect to the login page
    navigate("/");
  };
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

  const renderPredictions = (filterFn, showResult) =>
    predictions.filter(filterFn).map((prediction) => (
      <li key={prediction._id} className="prediction-item">
        <PredictionSummary
          prediction={prediction}
          logo={logos[prediction.symbol.toLowerCase()]}
          showResult={showResult}
        />
      </li>
    ));

  const isCountdownOver = (prediction) => {
    const timeElapsed = Math.floor(
      (Date.now() - new Date(prediction.predictedAt)) / 1000
    );
    return timeElapsed >= prediction.deliveryTime;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current && // Check if sidebarRef is set
        !sidebarRef.current.contains(event.target) && // Check if click is outside sidebar
        isMenuOpen // Only close if sidebar is open
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div>
      <header>
        <div
          className="title-container"
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
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
        sidebarRef={sidebarRef} // Attach the ref to Sidebar
        kycStatus={kycStatus}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        handleLogout={handleLogout}
      />

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {" "}
          <h2
            className="title"
            style={{
              marginTop: "5px",
              borderBottom: "2px solid green",
              width: "100px",
            }}
          >
            Contract
          </h2>
        </div>

        <div className="button-group">
          <div className="button-group">
            <button
              className={`tab-button ${selectedTab === "wait" ? "active" : ""}`}
              onClick={() => setSelectedTab("wait")}
            >
              Orders
            </button>
            <button
              className={`tab-button ${
                selectedTab === "finished" ? "active" : ""
              }`}
              onClick={() => setSelectedTab("finished")}
            >
              Position History
            </button>
          </div>
        </div>
        {selectedTab === "wait" ? (
          <ul className="prediction-list">
            {predictions.filter((prediction) => !isCountdownOver(prediction))
              .length === 0 ? (
              <p className="no-predictions">No pending orders.</p>
            ) : (
              renderPredictions(
                (prediction) => !isCountdownOver(prediction),
                false
              )
            )}
          </ul>
        ) : (
          <ul className="prediction-list">
            {predictions.filter((prediction) => isCountdownOver(prediction))
              .length === 0 ? (
              <p className="no-predictions">No position history.</p>
            ) : (
              renderPredictions(
                (prediction) => isCountdownOver(prediction),
                true
              )
            )}
          </ul>
        )}
      </div>
      {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} />}

      {showSignupModal && (
        <SignupModal closeModal={() => setShowSignupModal(false)} />
      )}
      <Footer />
    </div>
  );
};

export default Result;
