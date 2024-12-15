import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../wallet/WalletDashboard.css"; // Import the CSS file for styling
import { Sparklines, SparklinesLine } from "react-sparklines"; // Import Sparklines for the graphs
import Login from "./Login"; // Import the Login component
import SignupModal from "./SignupModal"; // Import the SignupModal component
import logo3 from "./logo3.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useTheme } from "../ThemeContext"; // Import ThemeContext for dark mode
import Footer from "./Footer";

export default function Card() {
  const url =
    "https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true";
  const [info, setInfo] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInfo, setFilteredInfo] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
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
  const [usdBalance, setUsdBalance] = useState(0);
  const [wallet, setWallet] = useState(null);
  const [prices, setPrices] = useState({});
  const [totalUsdBalance, setTotalUsdBalance] = useState(0);
  const userId = localStorage.getItem("_id");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("USD"); // Default to USD
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencySymbols, setCurrencySymbols] = useState({});
  const formattedBalance = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalUsdBalance * (exchangeRates[selectedCurrency] || 1));
  const { isDarkMode, toggleTheme } = useTheme(); // Access theme context
  const [email, setEmail] = useState(""); // State to hold the email
  const [showKycModal, setShowKycModal] = useState(false); // State to manage KYC modal visibility

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await axios.get(`https://trcnfx.com/api/users/${uid}`);
        setEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching email:", error);
      }
    };

    if (uid) {
      fetchEmail();
    }
  }, [uid]);
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
    shib: "shiba-inu",
    sol: "solana",
    steth: "lido-staked-ether",
    wbtc: "wrapped-bitcoin",
    link: "chainlink",
    leo: "leo-token",
  };
  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea (North)",
    "Korea (South)",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prevState) => !prevState);
  };

  useEffect(() => {
    axios
      .get(url, {
        headers: {
          "X-Cg-Pro-Api-Key": "CG-abdEKxm7HXgBnnG2D2eexnmq",
        },
      })
      .then((response) => {
        const cryptoData = response.data.filter(
          (crypto) => crypto.symbol !== "usdt"
        ); // Filter out USDT
        setInfo(cryptoData);
        setFilteredInfo(cryptoData);
      });

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
  useEffect(() => {
    const fetchCurrencySymbols = async () => {
      try {
        const response = await axios.get(
          "https://api.exchangerate.host/symbols"
        );
        console.log("Response from symbols API:", response.data);

        if (response.data && response.data.symbols) {
          const symbols = response.data.symbols;
          const formattedSymbols = Object.keys(symbols).reduce((acc, key) => {
            acc[key] = symbols[key].description; // Example: "USD": "Dollar"
            return acc;
          }, {});
          setCurrencySymbols(formattedSymbols);
        } else {
          console.error(
            "Symbols data is missing in API response. Using fallback."
          );
          setCurrencySymbols({
            USD: "$",
            EUR: "€",
            GBP: "£",
            JPY: "¥",
            AUD: "A$",
            CAD: "C$",
          }); // Add more as needed
        }
      } catch (error) {
        console.error("Error fetching currency symbols:", error);
        setCurrencySymbols({
          USD: "$",
          EUR: "€",
          GBP: "£",
          JPY: "¥",
          AUD: "A$",
          CAD: "C$",
        }); // Use fallback
      }
    };

    fetchCurrencySymbols();
  }, []);
  const [activeFooter, setActiveFooter] = useState("home"); // Default active is 'home'

  const handleFooterClick = (route) => {
    setActiveFooter(route); // Set the clicked footer as active
    handleNavigation(route); // Navigate to the corresponding route
  };
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
    const fetchWalletAndPrices = async () => {
      // const userId = localStorage.getItem("_id");

      try {
        const walletResponse = await axios.get(
          `https://trcnfx.com/api/wallet/${userId}`
        );
        const walletData = walletResponse.data;

        const symbols = Object.keys(walletData.balances).filter(
          (coin) => walletData.balances[coin] > 0
        );
        const fullNames = symbols.map(
          (symbol) => symbolToFullNameMap[symbol.toLowerCase()] || symbol
        );
        const priceResponse = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price`,
          {
            params: {
              ids: fullNames.join(","),
              vs_currencies: "usd",
            },
          }
        );

        setWallet(walletData);
        setPrices(priceResponse.data);

        const totalBalance = Object.entries(walletData.balances).reduce(
          (total, [coin, value]) => {
            const fullName = symbolToFullNameMap[coin.toLowerCase()] || coin;
            return total + (priceResponse.data[fullName]?.usd || 0) * value;
          },
          0
        );
        setTotalUsdBalance(totalBalance);
      } catch (error) {
        console.error("Error fetching wallet or prices:", error);
      }
    };

    if (userId) {
      fetchWalletAndPrices();
    }
  }, [userId]);

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
  useEffect(() => {
    const fetchTotalBalance = async () => {
      const uid = localStorage.getItem("_id");
      if (uid) {
        try {
          const response = await axios.get(
            `https://trcnfx.com/api/wallet/${uid}/total-balance`
          );
          const totalBalance = response.data.totalUsdBalance;
          setUsdBalance(totalBalance || 0); // Fallback to 0 if response is invalid
        } catch (error) {
          console.error("Error fetching total balance:", error);
          setUsdBalance(0); // Set fallback on error
        }
      }
    };
    fetchTotalBalance();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  // const handleKycSubmit = async (e) => {
  //   e.preventDefault();
  //   const formData = new FormData(e.target);
  //   formData.append("userId", uid);

  //   try {
  //     const response = await axios.post(
  //       "https://trcnfx.com/api/kyc",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //     setKycStatus("pending");
  //     setShowKycModal(false);
  //   } catch (error) {
  //     console.error("Error submitting KYC:", error);
  //   }
  // };

  const getGraphIndicator = (sparkline, priceChange) => {
    const color = priceChange >= 0 ? "#66FF00" : "	#ff0000";
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

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setSelectedCurrency(newCurrency);
    localStorage.setItem("selectedCurrency", newCurrency);
  };

  const renderKycStatus = () => {
    switch (kycStatus) {
      case "approved":
        return (
          <p className="header-text">
            Verified{" "}
            <i className="fas fa-check-circle" style={{ color: "green" }}></i>
          </p>
        );
      case "pending":
        return (
          <p className="header-text">
            KYC Pending{" "}
            <i
              className="fas fa-spinner fa-spin"
              style={{ color: "orange" }}
            ></i>
          </p>
        );
      case "rejected":
        return (
          <>
            <p className="header-text">
              KYC Rejected{" "}
              <i className="fas fa-times-circle" style={{ color: "red" }}></i>
            </p>
            <button
              onClick={() => setShowKycModal(true)}
              style={{
                backgroundColor: "var(--background-color)",
                color: "var(--text-color)",
                padding: "5px 10px",
                border: "none",
                cursor: "pointer",
                marginTop: "5px",
                borderRadius: "5px",
                fontSize: "12px",
              }}
            >
              Verify KYC
            </button>
          </>
        );
      default:
        return (
          <>
            <p className="header-text">
              Unverified{" "}
              <i className="fas fa-times-circle" style={{ color: "red" }}></i>
            </p>
            <button
              onClick={() => setShowKycModal(true)}
              style={{
                // backgroundColor: "var(--background-color)",
                color: "blue",
                borderBottom: "1px solid blue",
                // padding: "5px 10px",
                border: "none",
                cursor: "pointer",
                marginTop: "5px",

                fontSize: "12px",
              }}
            >
              Verify KYC
            </button>
          </>
        );
    }
  };

  // Define the logout function
  const handleLogout = () => {
    // Clear user-related data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("_id");
    localStorage.removeItem("userId");
    localStorage.removeItem("selectedCurrency");

    // Redirect to the login page
    navigate("/");
  };
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("userId", uid);

    try {
      const response = await axios.post(
        "https://trcnfx.com/api/kyc",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setKycStatus("pending");
      setShowKycModal(false);
    } catch (error) {
      console.error("Error submitting KYC:", error);
    }
  };
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmNewPassword } = e.target.elements;

    if (newPassword.value !== confirmNewPassword.value) {
      alert("New passwords do not match");
      return;
    }

    try {
      await axios.post("https://trcnfx.com/api/change-password", {
        userId: uid, // Use the user ID from local storage
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      });
      setShowChangePasswordModal(false);
      alert("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password.");
    }
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    if (searchValue) {
      const searchResults = info.filter((crypto) =>
        crypto.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setSuggestions(searchResults);
      setFilteredInfo(searchResults);
    } else {
      setSuggestions([]);
      setFilteredInfo(info);
    }
  };

  const handleSuggestionClick = (crypto) => {
    setSearchTerm(crypto.name);
    setSuggestions([]);
    setFilteredInfo([crypto]);
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
            {/* <div> */}
            <h1>
              <b style={{ fontSize: "25px" }} className="header-text">
                <Link to="/">TRCNFX</Link>
              </b>
            </h1>
            {/* </div> */}
            {/* <div > */}{" "}
            <button
              className="menu-button"
              onClick={() => {
                if (isLoggedIn) {
                  setIsMenuOpen(!isMenuOpen); // Toggle sidebar if logged in
                } else {
                  setShowLoginModal(true); // Show login modal if not logged in
                }
              }}
              style={{
                padding: "3px 10px",
                borderRadius: "100%",
              }}
            >
              &#9776;
            </button>
            {/* </div> */}
          </div>
        </header>

        <div
          id="sidebar"
          className={`sidebar ${isMenuOpen ? "open" : ""}`}
          ref={sidebarRef}
        >
          <div className="sidebar-header">
            {/* <img src={logo3} alt="logo" /> */}
            <p className="header-text" style={{ fontSize: "10px" }}>
              {email}
            </p>

            <p className="header-text">
              <b className="header-text">UID: {userrid}</b>
            </p>
            <div className="kyc-status-section">{renderKycStatus()}</div>
          </div>

          <div className="functions">
            <ul>
              {/* <li>
                <button
                  className="link"
                  onClick={() => handleNavigation("/wallet")}
                >
                  <i className="fas fa-wallet"></i> Wallet
                </button>
              </li> */}
              {/* <li>
                <button
                  className="link"
                  onClick={() => handleNavigation("/tradepage")}
                >
                  <i className="fas fa-exchange-alt"></i> Trade
                </button>
              </li> */}
              {/* <li>
                <button
                  className="link"
                  onClick={() => handleNavigation("/result")}
                >
                  <i className="fas fa-chart-line"></i> Result
                </button>
              </li> */}
              <li>
                <button
                  className="link"
                  onClick={() => handleNavigation("/transaction")}
                >
                  <i className="fas fa-pen"></i> Transactions
                </button>
              </li>
              <li style={{ marginTop: "5px" }}>
                <button
                  className="link"
                  onClick={() => navigate("/profit-stats")}
                >
                  <i className="fas fa-chart-bar"></i> Profit Statistics
                </button>
              </li>
              <li style={{ marginTop: "5px" }}>
                <button
                  className="link"
                  onClick={() => handleNavigation("/terms")}
                >
                  <i className="fas fa-book"></i> Privacy Policy
                </button>
              </li>

              {/* <li>
                <button className="link" onClick={() => navigate("/helpLoan")}>
                  <i className="fas fa-book"></i> Help Loan
                </button>
              </li> */}
              <li style={{ marginTop: "5px" }}>
                <button className="link" onClick={() => navigate("/contactUs")}>
                  <i className="fas fa-phone"></i> Contact Us
                </button>
              </li>
            </ul>
            <li style={{ marginTop: "5px" }}>
              <button
                className="link"
                onClick={() => {
                  setShowChangePasswordModal(true);
                  setIsMenuOpen(false);
                  console.log("Sidebar closed:", isMenuOpen); // Debug log
                }}
              >
                <i className="fas fa-lock"></i> Change Password
              </button>
            </li>

            {/* <div className="more-options">
              <ul>
                {isLoggedIn ? (
                  <li>
                    <Link to="/settings">
                      <i className="fa-solid fa-gear"></i> Settings
                    </Link>
                  </li>
                ) : (
                  <li>
                    <button onClick={() => setShowLoginModal(true)}>
                      <i className="fa-solid fa-person"></i> Login
                    </button>
                  </li>
                )}
              </ul>
            </div> */}
            <div
              className="theme-toggle"
              style={{
                marginTop: "10px",
                display: "flex",
                // justifyContent: "center",
                // textAlign: "center",
                alignItems: "center",
              }}
            >
              {" "}
              <p className="header-text">
                <i
                  class="fa fa-moon"
                  aria-hidden="true"
                  style={{ marginTop: "5px", marginRight: "15px" }}
                ></i>
                Dark Mode
              </p>
              <label
                className="theme-switch"
                style={{ marginTop: "13px", marginLeft: "10px" }}
              >
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ margin: "10px 0" }}>
              <label htmlFor="currency-select" style={{ marginRight: "10px" }}>
                {/* <i class="fa fa-money" aria-hidden="true"></i> */}
                Select Currency:
              </label>
              <select
                className="optionss"
                id="currency-select"
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                style={{
                  height: "25px", // Set height to make it smaller
                  fontSize: "12px", // Set font size to make the text smaller
                  padding: "0 5px", // Add padding to adjust spacing
                  borderRadius: "3px", // Add rounded edges
                }}
              >
                {Object.keys(exchangeRates).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            <li>
              <button
                className="link"
                onClick={handleLogout}
                style={{ color: "red" }} // Call the logout function
              >
                <i className="fas fa-sign-out-alt" style={{ color: "red" }}></i>{" "}
                Logout
              </button>
            </li>
          </div>
        </div>

        <div className="main-content">
          <div
            className="search-bar"
            style={{ marginBottom: "20px", width: "100%", height: "90%" }}
          >
            <div style={{ position: "relative", width: "100%", height: "90%" }}>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  height: "90%",
                  // backgroundColor: "#222e35",
                  padding: "10px",
                  paddingLeft: "40px", // Prevent overlap with the icon
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: "5px",
                  border: "0px solid #ccc",
                  // color: "white", // Ensure text is visible on dark background
                }}
              />
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af", // Set icon color
                  pointerEvents: "none", // Ensure no click or hover effect on the icon
                }}
              ></i>
            </div>

            {suggestions.length > 0 && (
              <ul
                className="suggestions"
                style={{
                  listStyle: "none",
                  padding: "0",
                  margin: "10px 0 0 0",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  backgroundColor: "#fff",
                  color: "black",
                }}
              >
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={suggestion.image}
                      alt={`${suggestion.symbol} logo`}
                      style={{
                        width: "24px",
                        height: "24px",
                        marginRight: "10px",
                      }}
                    />
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <h1 className="main-balance-text">Main Balance</h1>
          <div
            style={{
              display: "flex",
              // justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {" "}
            <h1 style={{ fontSize: "30px" }}>
              <b className="main-balance-text">
                {" "}
                {isBalanceVisible
                  ? currencySymbols[selectedCurrency]
                    ? `${currencySymbols[selectedCurrency]}${formattedBalance}`
                    : `${selectedCurrency} ${formattedBalance}`
                  : "****"}
              </b>
            </h1>
            <i
              className={`fa-regular ${
                isBalanceVisible ? "fa-eye" : "fa-eye-slash"
              }`}
              style={{
                color: "#9ca3af",
                marginLeft: "5px",
                fontSize: "15px",
                marginTop: "10px",
                cursor: "pointer",
              }}
              onClick={toggleBalanceVisibility}
            ></i>
          </div>

          {/* <div className="banner">
            <h2>Discover Seamless Crypto Trading</h2>
            <h2>With TRCNFX</h2>
            <p>Where Your Trust is Our Currency!</p>
          </div> */}
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "space-evenly",
            }}
          >
            {" "}
            <div style={{ justifyContent: "center", textAlign: "center" }}>
              {" "}
              <i
                id="icons-main-page"
                className="fa-solid fa-angles-down"
                style={{
                  // backgroundColor: "#222e35",
                  width: "60px", // Ensure width and height are equal
                  height: "60px",
                  display: "flex", // Center the icon within the circle
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%", // Make it a perfect circle
                  // color: "white", // Set icon color for better contrast
                }}
                onClick={() => handleNavigation("/wallet")}
              ></i>
              <h1 className="main-balance-text" style={{ marginTop: "5px" }}>
                Receive
              </h1>
            </div>
            <div style={{ justifyContent: "center", textAlign: "center" }}>
              {" "}
              <i
                id="icons-main-page"
                className="fa-solid fa-angles-up"
                style={{
                  // backgroundColor: "#222e35",
                  width: "60px", // Ensure width and height are equal
                  height: "60px",
                  display: "flex", // Center the icon within the circle
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%", // Make it a perfect circle
                  // color: "white", // Set icon color for better contrast
                }}
                onClick={() => handleNavigation("/wallet")}
              ></i>
              <h1 className="main-balance-text" style={{ marginTop: "5px" }}>
                Send
              </h1>
            </div>
            <div style={{ justifyContent: "center", textAlign: "center" }}>
              {" "}
              <i
                id="icons-main-page"
                className="fa-solid fa-right-left"
                style={{
                  // backgroundColor: "#222e35",
                  width: "60px", // Ensure width and height are equal
                  height: "60px",
                  display: "flex", // Center the icon within the circle
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%", // Make it a perfect circle
                  // color: "white", // Set icon color for better contrast
                  cursor: "pointer", // Change cursor on hover
                }}
                onClick={() => handleNavigation("/tradepage")}
              ></i>
              <h1 className="main-balance-text" style={{ marginTop: "5px" }}>
                Trade
              </h1>
            </div>
            <div style={{ justifyContent: "center", textAlign: "center" }}>
              {" "}
              <i
                id="icons-main-page"
                className="fa-solid fa-clock-rotate-left"
                style={{
                  // backgroundColor: "#222e35",
                  width: "60px", // Ensure width and height are equal
                  height: "60px",
                  display: "flex", // Center the icon within the circle
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%", // Make it a perfect circle
                  // color: "white", // Set icon color for better contrast
                }}
                onClick={() => handleNavigation("/transaction")}
              ></i>
              <h1 className="main-balance-text" style={{ marginTop: "5px" }}>
                History
              </h1>
            </div>
          </div>

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
                  <h3>{crypto.name}</h3>
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
          {/* <div className="market-tabs" style={{ justifyContent: "left" }}> */}
          <p
            className="active"
            style={{
              width: "133px",
              marginTop: "10px",
              marginLeft: "5px",
              marginBottom: "20px",
              fontSize: "18px",

              borderBottom: "3.5px solid green",
            }}
          >
            <b className="main-balance-text">Crypto Markets</b>
          </p>
          {/* </div> */}

          <div className="market-list">
            {filteredInfo.map((value, key) => {
              if (key < 20) {
                return (
                  <div
                    key={key}
                    className="market-item"
                    onClick={() => navigate("/trades", { state: { value } })}
                    style={{
                      // backgroundColor: "black",
                      borderBottom: "0.5px solid #3e3e3e",
                    }}
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
                        <h3>{value.symbol.toUpperCase()} </h3>
                        <p>{value.name.toUpperCase()} </p>

                        {/* <p>USDT</p> */}
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
        {showKycModal && (
          <div
            className="modal show"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "fixed",
              zIndex: 1000,
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              overflow: "auto",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "var(--highlight-color)",
                padding: "20px",
                border: "1px solid #888",
                width: "80%",
                maxWidth: "400px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                maxHeight: "80%", // Add maxHeight for scrolling
                overflowY: "auto", // Enable vertical scrolling
              }}
            >
              <span
                className="close"
                onClick={() => setShowKycModal(false)}
                style={{
                  color: "#aaa",
                  fontSize: "28px",
                  fontWeight: "bold",
                  position: "absolute",
                  top: "10px",
                  right: "20px",
                  cursor: "pointer",
                }}
              >
                &times;
              </span>
              <h2>Fill up KYC</h2>
              <form onSubmit={handleKycSubmit}>
                <div className="form-group">
                  <label>Date of Birth:</label>
                  <input type="date" name="dob" required />
                </div>
                <div className="form-group">
                  <label>Country:</label>
                  <select className="optionss" name="country" required>
                    <option value="" className="optionss">
                      Select your country
                    </option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Street Address:</label>
                  <input type="text" name="address" required />
                </div>
                <div className="form-group">
                  <label>Zip Code:</label>
                  <input type="text" name="zip" required />
                </div>
                <div className="form-group">
                  <label>Contact Number:</label>
                  <input type="text" name="contact" required />
                </div>
                <div className="form-group">
                  <label>Proof of Identity:</label>
                  <input
                    type="file"
                    name="identityProof"
                    accept="image/*"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Photo (PP Size or selfie):</label>
                  <input type="file" name="photo" accept="image/*" required />
                </div>
                <button
                  type="submit"
                  className="submit-button"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    color: "white",
                    padding: "10px",
                    borderRadius: "5px",
                  }}
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
        {showLoginModal && (
          <Login closeModal={() => setShowLoginModal(false)} />
        )}

        {showSignupModal && (
          <SignupModal closeModal={() => setShowSignupModal(false)} />
        )}
        {showChangePasswordModal && (
          <div className="modal show1" style={{ marginTop: "50px" }}>
            <div className="modal-content1">
              <span
                className="close"
                onClick={() => setShowChangePasswordModal(false)}
              >
                &times;
              </span>
              <h2 className="header-text">Change Password</h2>
              <form onSubmit={handleChangePasswordSubmit}>
                <div className="form-group">
                  <label style={{ color: "var(--text-color)" }}>
                    Old Password:
                  </label>
                  <input type="password" name="oldPassword" required />
                </div>
                <div className="form-group">
                  <label className="header-text">New Password:</label>
                  <input type="password" name="newPassword" required />
                </div>
                <div className="form-group">
                  <label className="header-text">Confirm New Password:</label>
                  <input type="password" name="confirmNewPassword" required />
                </div>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "blue",
                    color: "white",
                    width: "300px",
                    height: "50px",
                    padding: "10px",
                  }}
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
        <Footer />
      </div>
    );
  }
}
