import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./WalletDashboard.css"; // Import the CSS file for styling
import image from "./qr.png";
import { Link, useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import logo3 from "../Components/logo3.png";
import Login from "../Components/Login";
import SignupModal from "../Components/SignupModal";
import walletInfos from "./wallet-info.json"; // Make sure the path is correct
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";
const WalletDashboard = () => {
  const [walletData, setWalletData] = useState(null);
  const [cryptos, setCryptos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [selectedTab, setSelectedTab] = useState("Receive");
  const [amount, setAmount] = useState("");
  const [usdtValue, setUsdtValue] = useState("");
  const [address, setAddress] = useState("");
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [proof, setProof] = useState(null);
  const userId = localStorage.getItem("_id");
  const uid = localStorage.getItem("userId");
  const [frozenAmounts, setFrozenAmounts] = useState({});
  const [currencySymbols, setCurrencySymbols] = useState({});

  const navigate = useNavigate();
  const sidebarRef = useRef();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usdDepositAmount, setUsdDepositAmount] = useState("");
  const [cryptoDepositAmount, setCryptoDepositAmount] = useState("");
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalIconColor, setModalIconColor] = useState("green");
  const [redirectAfterModal, setRedirectAfterModal] = useState(false);
  const [kycStatus, setKycStatus] = useState(""); // State to manage KYC status
  const id1 = localStorage.getItem("_id");
  // const [walletInfo, setWalletInfo] = useState(null);
  const [isLoadingWalletInfo, setIsLoadingWalletInfo] = useState(true);
  const [isLoadingRecharge, setIsLoadingRecharge] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [totalUsdBalance, setTotalUsdBalance] = useState(0);
  const [exchangeRates, setExchangeRates] = useState({});
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
  const [wallet, setWallet] = useState(null);
  const [price, setPrices] = useState({});
  const [usdBalance, setUsdBalance] = useState(0);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  // const toggleBalanceVisibility = () => {
  //   setIsBalanceVisible((prevState) => !prevState);
  // };
  // const [modalIconColor, setModalIconColor] = useState("green");
  // const [modalMessage, setModalMessage] = useState("");
  const [walletLogos, setWalletLogos] = useState({});
  const [rechargeSuccessMessage, setRechargeSuccessMessage] = useState(""); // New state
  const [selectedCurrency, setSelectedCurrency] = useState("USD"); // Default to USD
  const formattedBalance = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalUsdBalance * (exchangeRates[selectedCurrency] || 1));
  const [walletInfo, setWalletInfo] = useState({
    qrCodeUrl: "",
    walletAddress: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCryptos, setFilteredCryptos] = useState([]);
  const [primaryWallets, setPrimaryWallets] = useState([]);
  const [secondaryWallets, setSecondaryWallets] = useState([]);
  const cryptoShortNames = {
    BITCOIN: "BTC",
    ETHEREUM: "ETH",
    TETHER: "USDT",
    BINANCECOIN: "BNB",
    SOLANA: "SOL",
    "USD-COIN": "USDC",
    XRP: "XRP",
    "LIDO STAKED ETHER": "STETH",
    DOGECOIN: "DOGE",
    CARDANO: "ADA",
    TRON: "TRX",
    TONCOIN: "TON",
    "WRAPPED STETH": "WSTETH",
    AVALANCHE: "AVAX",
    "WRAPPED BITCOIN": "WBTC",
    "SHIBA INU": "SHIB",
    WETH: "WETH",
    POLKADOT: "DOT",
    CHAINLINK: "LINK",
    "BITCOIN CASH": "BCH",
    "LEO TOKEN": "LEO",
    "NEAR PROTOCOL": "NEAR",
    LITECOIN: "LTC",
    DAI: "DAI",
    UNISWAP: "UNI",
    "WRAPPED EETH": "WEETH",
    KASPA: "KAS",
    POLYGON: "MATIC",
    "INTERNET COMPUTER": "ICP",
    APTOS: "APT",
    PEPE: "PEPE",
    MONERO: "XMR",
    "ETHENA USDE": "USDE",
    // Add other mappings as needed
  };

  // useEffect(() => {
  //   const fetchWalletInfo = async () => {
  //     try {
  //       const response = await axios.get("http://localhost:3001/api/wallet-info");
  //       const walletInfos = response.data;

  //       // Separate primary and secondary wallets
  //       const primarySymbols = walletInfos.map((info) =>
  //         info.symbol.toLowerCase()
  //       );
  //       const primary = Object.keys(walletData.balances).filter((symbol) =>
  //         primarySymbols.includes(symbol)
  //       );
  //       const secondary = Object.keys(walletData.balances).filter(
  //         (symbol) => !primarySymbols.includes(symbol)
  //       );

  //       setPrimaryWallets(primary);
  //       setSecondaryWallets(secondary);
  //     } catch (error) {
  //       console.error("Error fetching wallet info:", error);
  //     }
  //   };

  //   fetchWalletInfo();
  // }, [walletData]);
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prevState) => !prevState);
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
  const handleNavigation = (route) => {
    if (isLoggedIn) {
      navigate(route);
    } else {
      setShowLoginModal(true);
    }
  };
  useEffect(() => {
    const fetchWalletAndPrices = async () => {
      // const userId = localStorage.getItem("_id");

      try {
        const walletResponse = await axios.get(
          `http://localhost:3001/api/wallet/${userId}`
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
  useEffect(() => {
    const fetchTotalBalance = async () => {
      const uid = localStorage.getItem("_id");
      if (uid) {
        try {
          const response = await axios.get(
            `http://localhost:3001/api/wallet/${uid}/total-balance`
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
  useEffect(() => {
    const fetchWalletInfo = () => {
      try {
        // Map wallet symbols from JSON (walletInfos) to lowercase
        const primarySymbols = walletInfos.map((info) =>
          info.symbol.toLowerCase()
        );

        // Filter primary wallets based on the JSON symbols
        const primary = Object.keys(walletData?.balances || {}).filter(
          (symbol) => primarySymbols.includes(symbol.toLowerCase())
        );

        // Filter secondary wallets (those not in the JSON list)
        const secondary = Object.keys(walletData?.balances || {}).filter(
          (symbol) => !primarySymbols.includes(symbol.toLowerCase())
        );

        // Set the state for primary and secondary wallets
        setPrimaryWallets(primary);
        setSecondaryWallets(secondary);
      } catch (error) {
        console.error("Error fetching wallet info from JSON:", error);
      }
    };

    // Ensure walletData is available before processing
    if (walletData) {
      fetchWalletInfo();
    }
  }, [walletData]);
  const fetchFrozenAmounts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/frozen/${userId}`
      );
      const frozenData = response.data.reduce((acc, item) => {
        acc[item.symbol.toLowerCase()] = item.amount; // Ensure symbols are lowercase
        return acc;
      }, {});
      console.log(frozenData); // Debug to check the data structure
      setFrozenAmounts(frozenData);
    } catch (error) {
      console.error("Error fetching frozen amounts:", error);
    }
  };

  // useEffect(() => {
  //   const fetchWalletInfo = async () => {
  //     try {
  //       const symbol =
  //         selectedSymbol === "usd" ? "TETHER" : selectedSymbol.toUpperCase();
  //       const response = await axios.get(
  //         `http://localhost:3001/api/wallet-info/${symbol}`
  //       );
  //       setWalletInfo(response.data);
  //       setIsLoadingWalletInfo(false);
  //     } catch (error) {
  //       console.error("Error fetching wallet info:", error);
  //       setIsLoadingWalletInfo(false);
  //     }
  //   };

  //   fetchWalletInfo();
  // }, [selectedSymbol]);
  // useEffect(() => {
  //   const fetchWalletInfo = async () => {
  //     try {
  //       let symbol = selectedSymbol.toUpperCase();

  //       // Handle USDT (Tether) wallet info
  //       if (symbol === "USDT") {
  //         symbol = "TETHER"; // Use the actual identifier for Tether
  //       }

  //       const response = await axios.get(
  //         `http://localhost:3001/api/wallet-info/${symbol}`
  //       );

  //       setWalletInfo(response.data);
  //       setIsLoadingWalletInfo(false);
  //     } catch (error) {
  //       console.error("Error fetching wallet info:", error);
  //       setIsLoadingWalletInfo(false);
  //     }
  //   };

  //   fetchWalletInfo();
  // }, [selectedSymbol]);
  useEffect(() => {
    const fetchWalletInfo = () => {
      try {
        let symbol = selectedSymbol.toUpperCase();

        // Handle USDT (Tether) wallet info
        if (symbol === "USDT") {
          symbol = "TETHER"; // Use the actual identifier for Tether
        }

        // Find the wallet info for the selected symbol from the JSON data
        const walletInfoData = walletInfos.find(
          (wallet) => wallet.symbol.toUpperCase() === symbol
        );

        if (walletInfoData) {
          setWalletInfo(walletInfoData); // Set wallet info from the JSON
        } else {
          // Set to empty if no matching data is found
          setWalletInfo({ qrCodeUrl: "", walletAddress: "" });
        }

        setIsLoadingWalletInfo(false);
      } catch (error) {
        console.error("Error fetching wallet info from JSON:", error);
        setIsLoadingWalletInfo(false);
      }
    };

    fetchWalletInfo(); // Call the function
  }, [selectedSymbol]);

  const cryptoFullNames = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    USDT: "Tether",
    BNB: "Binance Coin",
    SOL: "Solana",
    USDC: "USD Coin",
    ADA: "Cardano",
    TRX: "Tron",
    DOT: "Polkadot",
    LINK: "Chainlink",
    LTC: "Litecoin",
    DAI: "Dai",
    // Add other mappings as needed
  };
  const handleCryptoClick = (symbol) => {
    const fullName = cryptoFullNames[symbol.toUpperCase()] || symbol;
    setSelectedSymbol(fullName); // Pass the full name
    setSelectedTab("Receive");
    setShowCryptoModal(true);
  };

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
  useEffect(() => {
    const fetchWalletLogos = async () => {
      try {
        const logos = {};
        for (const symbol of primaryWallets) {
          const lowerSymbol = symbol.toLowerCase();
          const logoResponse = await axios.get(
            `https://pro-api.coingecko.com/api/v3/coins/${lowerSymbol}`,
            {
              headers: {
                "X-Cg-Pro-Api-Key": "CG-abdEKxm7HXgBnnG2D2eexnmq",
              },
            }
          );
          const imageUrl = logoResponse.data.image.large;
          const imageResponse = await axios.get(
            "http://localhost:3001/api/fetch-image",
            {
              params: { imageUrl },
            }
          );
          logos[symbol] = `data:image/jpeg;base64,${imageResponse.data.image}`;
        }
        setWalletLogos(logos);
      } catch (error) {
        console.error("Error fetching wallet logos:", error);
      }
    };

    if (primaryWallets.length > 0) {
      fetchWalletLogos();
    }
  }, [primaryWallets]);

  useEffect(() => {
    // Check if the user is logged in by checking the localStorage for authToken
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }

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

  useEffect(() => {
    // Check if the user is logged in by checking the localStorage for authToken
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const formatBalance = (balance) => {
    const threshold = 1e-8; // Set a reasonable threshold
    return balance < threshold ? 0 : balance.toFixed(8);
  };
  useEffect(() => {
    if (userId) {
      fetchFrozenAmounts(); // Call to fetch frozen amounts once the userId is available
    }
  }, [userId]);
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/wallet/${userId}/balances`
        );
        const data = response.data;

        // Convert "USD" to "USDT" in the fetched data
        // if (data.balances["USD"]) {
        //   data.balances["USDT"] = data.balances["USD"];
        //   delete data.balances["USD"];
        // }
        // if (data.prices["USD"]) {
        //   data.prices["USDT"] = data.prices["USD"];
        //   delete data.prices["USD"];
        // }

        setWalletData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        setIsLoading(false);
      }
    };

    const fetchCryptos = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/cryptos");
        setCryptos(response.data);
      } catch (error) {
        console.error("Error fetching cryptocurrencies:", error);
      }
    };

    fetchWalletData();
    fetchCryptos();
  }, [userId]);

  const handleConvertAmountChange = (e) => {
    const value = e.target.value;
    setUsdtValue(value);
    if (
      walletData &&
      walletData.prices &&
      walletData.prices[selectedSymbol] &&
      walletData.prices[selectedSymbol].usd !== undefined
    ) {
      const cryptoValue = value / walletData.prices[selectedSymbol].usd;
      setAmount(cryptoValue < 1e-8 ? "0.00" : cryptoValue.toFixed(8));
    }
  };

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  // const handleCryptoClick = (symbol) => {
  //   setSelectedSymbol(symbol);
  //   setSelectedTab("Receive"); // Default to the "Receive" tab
  //   setShowCryptoModal(true); // Show the crypto modal
  // };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setAddress(text);
  };

  const handleMax = () => {
    const maxCryptoAmount = walletData?.balances[selectedSymbol] || 0;
    setAmount(maxCryptoAmount);
    if (
      walletData &&
      walletData.prices &&
      walletData.prices[selectedSymbol] &&
      walletData.prices[selectedSymbol].usd !== undefined
    ) {
      setUsdAmount(
        (maxCryptoAmount * walletData.prices[selectedSymbol].usd).toFixed(2)
      );
    }
  };
  const handleMaxConvertAssetValue = () => {
    const maxCryptoAmount = walletData?.balances[selectedSymbol] || 0;
    setAmount(maxCryptoAmount); // Set the asset value

    if (
      walletData &&
      walletData.prices &&
      walletData.prices[selectedSymbol]?.usd
    ) {
      const usdValue = maxCryptoAmount * walletData.prices[selectedSymbol].usd;
      setUsdtValue(usdValue.toFixed(2)); // Automatically fill the USD amount
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === "") {
      setFilteredCryptos([]);
    } else {
      setFilteredCryptos(
        cryptos.filter(
          (crypto) =>
            crypto.name.toLowerCase().includes(term) ||
            crypto.symbol.toLowerCase().includes(term)
        )
      );
    }
  };

  const handleMaxConvert = () => {
    const maxCryptoAmount = walletData?.balances[selectedSymbol] || 0;
    setAmount(maxCryptoAmount);
    if (
      walletData &&
      walletData.prices &&
      walletData.prices[selectedSymbol] &&
      walletData.prices[selectedSymbol].usd !== undefined
    ) {
      setUsdtValue(
        (maxCryptoAmount * walletData.prices[selectedSymbol].usd).toFixed(2)
      );
    }
  };

  const handleMaxConvertUSD = () => {
    if (
      walletData &&
      walletData.balances &&
      walletData.prices &&
      walletData.prices[selectedSymbol] &&
      walletData.prices[selectedSymbol].usd !== undefined
    ) {
      const maxUsdAmount =
        (walletData.balances[selectedSymbol] || 0) *
        (walletData.prices[selectedSymbol]?.usd || 0);
      setUsdtValue(maxUsdAmount.toFixed(2));
      setAmount(
        (maxUsdAmount / (walletData.prices[selectedSymbol]?.usd || 1)).toFixed(
          8
        )
      );
    }
  };

  const [usdAmount, setUsdAmount] = useState("");
  // const handleSendSubmit = async (e) => {
  //   e.preventDefault();

  //   const cryptoPrice = walletData.prices[selectedSymbol]?.usd;
  //   const cryptoAmount = parseFloat(usdAmount) / cryptoPrice;

  //   if (cryptoAmount > walletData.balances[selectedSymbol]) {
  //     setModalMessage("Insufficient balance.");
  //     setModalIconColor("red");
  //     setShowSuccessPopup(true);
  //     return;
  //   }

  //   if (cryptoAmount <= 0 || usdAmount === "") {
  //     setModalMessage("Amount should be greater than 0.");
  //     setModalIconColor("red");
  //     setShowSuccessPopup(true);
  //     return;
  //   }

  //   try {
  //     await axios.post("http://localhost:3001/api/send", {
  //       userId,
  //       symbol: selectedSymbol,
  //       amount: parseFloat(cryptoAmount.toFixed(8)),
  //       address,
  //     });

  //     setModalMessage("Send request submitted successfully");
  //     setModalIconColor("green");
  //     setShowSuccessPopup(true);
  //     setUsdAmount("");
  //     setAmount("");
  //     setAddress("");
  //   } catch (error) {
  //     console.error("Error submitting send request:", error);
  //     setModalMessage("Failed to submit send request");
  //     setModalIconColor("red");
  //     setShowSuccessPopup(true);
  //   }
  // };
  const handleSendSubmit = async (e) => {
    e.preventDefault();

    const cryptoPrice = walletData.prices[selectedSymbol]?.usd;
    const cryptoAmount = parseFloat(usdAmount) / cryptoPrice;

    // Check if the balance is sufficient
    if (cryptoAmount > walletData.balances[selectedSymbol]) {
      setModalMessage("Insufficient balance.");
      setModalIconColor("red");
      setShowSuccessPopup(true);
      return;
    }

    if (cryptoAmount <= 0 || usdAmount === "") {
      setModalMessage("Amount should be greater than 0.");
      setModalIconColor("red");
      setShowSuccessPopup(true);
      return;
    }

    try {
      // Make a request to the API to process the send request
      const response = await axios.post("http://localhost:3001/api/send", {
        userId,
        symbol: selectedSymbol,
        amount: parseFloat(cryptoAmount.toFixed(8)),
        address,
      });

      // Display success message after the send request is processed
      setModalMessage("Send request submitted successfully.");
      setModalIconColor("green");
      setShowSuccessPopup(true);

      // Fetch the updated wallet data (which will now reflect the frozen amount)
      const walletResponse = await axios.get(
        `http://localhost:3001/api/wallet/${userId}/balances`
      );
      setWalletData(walletResponse.data); // Update the wallet data with the new balances and frozen amounts

      // Clear form fields
      setUsdAmount("");
      setAmount("");
      setAddress("");
    } catch (error) {
      console.error("Error submitting send request:", error);
      setModalMessage("Failed to submit send request.");
      setModalIconColor("red");
      setShowSuccessPopup(true);
    }
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();

    if (
      walletData &&
      parseFloat(amount) > walletData.balances[selectedSymbol]
    ) {
      setModalMessage("Insufficient balance.");
      setModalIconColor("red");
      setShowSuccessPopup(true);
      return;
    }

    if (parseFloat(amount) <= 0 || amount === "") {
      setModalMessage("Amount should be greater than 0.");
      setModalIconColor("red");
      setShowSuccessPopup(true);
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/convert", {
        userId,
        fromSymbol: selectedSymbol,
        toSymbol: "tether", // Converting to USDT
        amount: parseFloat(amount),
      });

      setModalMessage("Conversion Successfull!.");
      setModalIconColor("green");
      setShowSuccessPopup(true);
      setAmount("");
      setUsdtValue("");
    } catch (error) {
      console.error("Error submitting conversion request:", error);
      setModalMessage("Failed to submit conversion request.");
      setModalIconColor("red");
      setShowSuccessPopup(true);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    if (selectedCrypto) {
      try {
        const usdAmount = parseFloat(usdtValue);
        if (!isNaN(usdAmount) && usdAmount > 0) {
          const response = await axios.post(
            "http://localhost:3001/api/convert",
            {
              userId,
              fromSymbol: "tether",
              toSymbol: selectedCrypto.id,
              amount: usdAmount,
            }
          );
          setModalMessage("Conversion successful");
          setModalIconColor("green");
          setShowMessageModal(true);
          setAmount("");
          setUsdtValue("");
          setSelectedCrypto(null);

          // Update walletData safely
          if (response.data && response.data.balances && response.data.prices) {
            setWalletData(response.data);
          }
          setRedirectAfterModal(true); // Set redirectAfterModal to true
        } else {
          alert("Invalid USD amount");
        }
      } catch (error) {
        console.error("Error during conversion:", error);
        setModalMessage("Insufficient Balance");
        setModalIconColor("red");
        setShowMessageModal(true);
      }
    }
  };

  const handleUsdAmountChange = (value, setCryptoAmount, setUsdAmount) => {
    setUsdAmount(value);
    if (
      walletData &&
      walletData.prices &&
      walletData.prices[selectedSymbol] &&
      walletData.prices[selectedSymbol].usd !== undefined
    ) {
      const cryptoValue = value / walletData.prices[selectedSymbol].usd;
      setCryptoAmount(cryptoValue < 1e-8 ? "0.00" : cryptoValue.toFixed(8));
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();

    setIsLoadingRecharge(true); // Start loading

    if (parseFloat(usdDepositAmount) <= 0 || usdDepositAmount === "") {
      alert("Amount should be greater than 0.");
      setIsLoadingRecharge(false); // Stop loading in case of error
      return;
    }

    const formData = new FormData();
    formData.append("amount", cryptoDepositAmount);
    formData.append("proof", proof);
    formData.append("userId", userId);
    formData.append("selectedSymbol", selectedSymbol);
    formData.append("uid", uid); // Add this line to include the UID in the form data

    try {
      await axios.post("http://localhost:3001/api/deposit", formData);

      // Set success message and show the success popup
      setRechargeSuccessMessage("Recharge request submitted successfully");
      setModalMessage("Recharge request submitted successfully");
      setModalIconColor("green");
      setShowSuccessPopup(true);

      // Clear form data and close the recharge modal
      setUsdDepositAmount("");
      setCryptoDepositAmount("");
      setProof(null);
      // setShowRechargeModal(false); // Close the recharge modal
    } catch (error) {
      console.error("Error submitting deposit request:", {
        message: error.message,
        stack: error.stack,
        response: error.response ? error.response.data : null,
      });
      setModalMessage("Failed to submit deposit request");
      setModalIconColor("red");
      setShowSuccessPopup(true); // Show error popup
    } finally {
      setIsLoadingRecharge(false); // Stop loading
    }
  };

  const handleUsdDepositAmountChange = (e) => {
    const value = e.target.value;
    setUsdDepositAmount(value);
    if (
      walletData &&
      walletData.prices &&
      walletData.prices[selectedSymbol] &&
      walletData.prices[selectedSymbol].usd !== undefined
    ) {
      const cryptoValue = value / walletData.prices[selectedSymbol].usd;
      setCryptoDepositAmount(
        cryptoValue < 1e-8 ? "0.00" : cryptoValue.toFixed(8)
      );
    }
  };

  const handleCryptoDepositAmountChange = (e) => {
    const value = e.target.value;
    setCryptoDepositAmount(value);
    if (
      walletData &&
      walletData.prices &&
      walletData.prices[selectedSymbol] &&
      walletData.prices[selectedSymbol].usd !== undefined
    ) {
      const usdValue = value * walletData.prices[selectedSymbol].usd;
      setUsdDepositAmount(usdValue < 1e-8 ? "0.00" : usdValue.toFixed(2));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!walletData) {
    return <div>Error fetching wallet data.</div>;
  }

  const { balances, prices } = walletData || { balances: {}, prices: {} };
  const totalBalance = Object.keys(balances).reduce((acc, symbol) => {
    const price = prices[symbol]?.usd;
    if (price !== undefined) {
      return acc + balances[symbol] * price;
    }
    return acc;
  }, 0);

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
        sidebarRef={sidebarRef}
        // email={email}
        userId={userId}
        kycStatus={kycStatus}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        // handleLogout={handleLogout}
      />
      <div className="main-content">
        {/* <div className="banner">
          <h2>Discover Seamless Crypto Trading</h2>
          <h2>With TRCNFX</h2>
          <p>Where Your Trust is Our Currency</p>
        </div> */}
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
              fontSize: "18px",
              marginTop: "5px",
              borderBottom: "2px solid green",
              width: "60px",
            }}
          >
            Wallets
          </h2>
        </div>
        <h1 className="main-balance-text">Main Balance</h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            textAlign: "center",
            marginLeft: "10px",
          }}
        >
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

        {/* <div className="search-bar">
          <input
            type="text"
            placeholder="Search for a crypto wallet..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div> */}

        <div className="market-list" style={{ marginTop: "30px" }}>
          {searchTerm ? (
            filteredCryptos.map((crypto) => (
              <div
                key={crypto.id}
                className="market-item"
                onClick={() => handleCryptoClick(crypto.symbol)}
              >
                <img
                  src={crypto.logo}
                  alt={crypto.name}
                  className="crypto-logo"
                />
                <div className="market-info">
                  <h3>{crypto.name}</h3>
                  <p>{crypto.symbol.toUpperCase()}</p>
                </div>
              </div>
            ))
          ) : (
            <>
              {primaryWallets.map((symbol) => {
                // Check if the symbol is Tether (USDT) and override the balance with the USD value
                const isTether =
                  symbol.toLowerCase() === "tether" ||
                  symbol.toLowerCase() === "usdt";
                const displayBalance = isTether
                  ? walletData.balances["tether"] // Use USD balance instead of Tether balance
                  : walletData.balances[symbol];

                const displayPrice =
                  walletData.prices[symbol]?.usd !== undefined
                    ? walletData.prices[symbol].usd
                    : 0;

                return (
                  <div
                    key={symbol}
                    className="market-item"
                    onClick={() => handleCryptoClick(symbol)}
                    style={{
                      // backgroundColor: "black",
                      borderBottom: "0.5px solid #3e3e3e",
                    }}
                  >
                    <div className="market-info">
                      <div style={{ display: "flex" }}>
                        <img
                          style={{ height: "30px", width: "30px" }}
                          src={
                            walletLogos[symbol] ||
                            "https://via.placeholder.com/30"
                          }
                          alt={symbol}
                          className="crypto-logo"
                        />
                        <div>
                          <h3>
                            {cryptoShortNames[symbol.toUpperCase()] || symbol}
                          </h3>
                          <p>{isTether ? "USD" : symbol.toUpperCase()}</p>{" "}
                          {/* Show USD if it's Tether */}
                        </div>
                      </div>
                    </div>
                    <div className="market-stats">
                      <p>
                        {formatBalance(displayBalance || 0)}{" "}
                        {cryptoShortNames[symbol.toUpperCase()] || symbol}
                      </p>
                      <p>
                        USD${" "}
                        {displayPrice !== undefined
                          ? (displayBalance * displayPrice).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                  </div>
                );
              })}

              <hr />
              {secondaryWallets.map((symbol) => (
                <div
                  key={symbol}
                  className="market-item"
                  style={{ display: searchTerm ? "block" : "none" }} // Show only if searched
                  onClick={() => handleCryptoClick(symbol)}
                >
                  <div className="market-info">
                    <h3>{cryptoFullNames[symbol.toUpperCase()] || symbol}</h3>{" "}
                    {/* Display full name */}
                    <p>{symbol.toUpperCase()}</p>
                  </div>
                  <div className="market-stats">
                    <p>
                      {formatBalance(walletData.balances[symbol] || 0)}{" "}
                      {symbol.toUpperCase()}
                    </p>
                    <p>
                      USD${" "}
                      {walletData.prices[symbol]?.usd !== undefined
                        ? (
                            walletData.balances[symbol] *
                            walletData.prices[symbol].usd
                          ).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      {showCryptoModal && (
        <div
          className="modal show"
          id="crypto-modal"
          // style={{ backgroundColor: "black" }}
        >
          <div
            id="wallet-modalss"
            className="modal-content"
            style={{ border: "none" }}
          >
            <span
              className="close"
              onClick={() => setShowCryptoModal(false)}
              // style={{ color: "white" }}
            >
              &times;
            </span>

            <div className="wallet" style={{ border: "0.5px solid #6c6969" }}>
              <div
                className="wallet-header"
                style={{ borderBottom: "0.5px solid #6c6969" }}
              >
                <h1 className="labels23">
                  {selectedSymbol === "tether"
                    ? "USDT"
                    : selectedSymbol.toUpperCase()}{" "}
                  Wallet
                </h1>
              </div>

              <div className="wallet-balance">
                <p>
                  USDT${" "}
                  {(
                    (balances[selectedSymbol] || 0) *
                    (prices[selectedSymbol]?.usd || 0)
                  ).toFixed(4)}
                </p>
                <p>
                  Available Coins: {balances[selectedSymbol] || 0}{" "}
                  {selectedSymbol.toUpperCase()}
                </p>
                <p>
                  {" "}
                  <p>
                    {frozenAmounts[selectedSymbol] && (
                      <span>
                        (Frozen: {frozenAmounts[selectedSymbol].toFixed(8)}{" "}
                        {selectedSymbol.toUpperCase()})
                      </span>
                    )}
                  </p>
                </p>
              </div>
              <div className="wallet-tabs">
                <button
                  style={{ borderRadius: "0" }}
                  data-tab="Receive"
                  className={selectedTab === "Receive" ? "active" : ""}
                  onClick={() => handleTabClick("Receive")}
                >
                  Receive
                </button>
                <button
                  style={{ borderRadius: "0" }}
                  data-tab="Send"
                  className={selectedTab === "Send" ? "active" : ""}
                  onClick={() => handleTabClick("Send")}
                >
                  Send
                </button>
                <button
                  style={{ borderRadius: "0" }}
                  data-tab="Convert"
                  className={selectedTab === "Convert" ? "active" : ""}
                  onClick={() => handleTabClick("Convert")}
                >
                  Convert
                </button>
              </div>
              {selectedTab === "Receive" && (
                <div id="Receive" className="tab-content active">
                  {/* <p style={{ marginTop: "20px", marginBottom: "10px" }}>
                    Deposit
                  </p> */}
                  <div className="wallet-buttons">
                    <span
                      className="recharge-link"
                      onClick={() => setShowRechargeModal(true)}
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        justifyContent: "center",
                        textAlign: "center",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "#7d9aea",
                          marginTop: "20px",
                          borderBottom: "0.5px solid #7d9aea ",
                          width: "65px",
                        }}
                      >
                        Recharge
                      </p>
                    </span>
                  </div>
                  <div
                    className="wallet-qr"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      textAlign: "center",
                      alignItems: "center",
                      marginTop: "20px",
                    }}
                  >
                    {isLoadingWalletInfo ? (
                      <p>Loading...</p>
                    ) : (
                      <>
                        <img src={walletInfo.qrCodeUrl} alt="QR Code" />
                        <p id="btc-address" style={{ marginTop: "30px" }}>
                          {walletInfo.walletAddress}
                        </p>
                        <div style={{ display: "flex" }}>
                          {" "}
                          <h3
                            id="copy-texts"
                            style={{
                              marginBottom: "20px",
                              // color: "white",
                              // borderBottom: "0.5px solid white ",
                            }}
                            className="copy-address"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(
                                  walletInfo.walletAddress
                                );
                                setCopyButtonText("Copied!");
                                setShowCopiedMessage(true);
                                setTimeout(() => {
                                  setCopyButtonText("Copy");
                                  setShowCopiedMessage(false);
                                }, 5000); // Change the text back after 5 seconds
                              } catch (error) {
                                console.error("Failed to copy address:", error);
                                alert(
                                  "Failed to copy address. Please try again."
                                );
                              }
                            }}
                          >
                            {copyButtonText}
                          </h3>
                          <i
                            class="fa fa-clone"
                            aria-hidden="true"
                            style={{
                              marginTop: "7px",
                              marginLeft: "4px",
                              fontSize: "14px",
                            }}
                          ></i>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedTab === "Send" && (
                <div id="Send" className="tab-content active">
                  {/* <p>Send Cryptocurrency</p> */}
                  <form onSubmit={handleSendSubmit}>
                    <div className="form-group">
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
                            backgroundColor: "rgba(0, 0, 0, 0.4)",
                            zIndex: "1000",
                          }}
                        >
                          <div
                            className="modal-content"
                            style={{
                              backgroundColor: "#fefefe",
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
                            <span
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
                            </span>
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
                                  fill={modalIconColor}
                                  width="80px"
                                  height="80px"
                                >
                                  <path d="M0 0h24v24H0z" fill="none" />
                                  <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12s12-5.37 12-12C24 5.37 18.63 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM10 17.2l-5.3-5.3 1.4-1.4 3.9 3.9 7.9-7.9 1.4 1.4L10 17.2z" />
                                  {modalIconColor === "red" && (
                                    <path
                                      d="M15.41 8.59L12 12l-3.41-3.41L7 10l5 5 5-5z"
                                      fill="red"
                                    />
                                  )}
                                </svg>
                              </div>
                            </div>
                            <h2 style={{ color: "black" }}>{modalMessage}</h2>
                            <button
                              onClick={() => setShowSuccessPopup(false)}
                              style={{
                                display: "block",
                                width: "100%",
                                padding: "10px",
                                background:
                                  "linear-gradient(to right, #4caf50, #81c784)",
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
                      <label style={{ fontSize: "12px", marginTop: "25px" }}>
                        USD Amount:
                      </label>{" "}
                      <div
                        style={{
                          display: "flex",
                          padding: "2px 2px 2px 2px",
                        }}
                      >
                        <input
                          type="number"
                          value={usdAmount}
                          style={{
                            marginRight: "15px",
                            marginLeft: "10px",
                            height: "30px",
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            setUsdAmount(value);
                            if (
                              walletData &&
                              walletData.prices &&
                              walletData.prices[selectedSymbol]?.usd !==
                                undefined
                            ) {
                              const cryptoValue =
                                value / walletData.prices[selectedSymbol].usd;
                              setAmount(
                                cryptoValue < 1e-8 ? 0 : cryptoValue.toFixed(8)
                              );
                            }
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={handleMax}
                          style={{ marginRight: "10px" }}
                        >
                          Max
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: "12px" }}>
                        {selectedSymbol.toUpperCase()} Value:
                      </label>
                      <div
                        style={{
                          display: "flex",
                          padding: "2px 2px 2px 2px",
                        }}
                      >
                        <input
                          type="number"
                          value={amount}
                          style={{
                            marginRight: "15px",
                            marginLeft: "10px",
                            height: "30px",
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            setAmount(value);
                            if (
                              walletData &&
                              walletData.prices &&
                              walletData.prices[selectedSymbol]?.usd !==
                                undefined
                            ) {
                              const usdValue =
                                value * walletData.prices[selectedSymbol].usd;
                              setUsdAmount(
                                usdValue < 1e-8 ? "0.00" : usdValue.toFixed(2)
                              );
                            }
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={handleMax}
                          style={{ marginRight: "10px" }}
                        >
                          Max
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: "12px" }}>
                        Wallet Address:
                      </label>
                      <input
                        type="text"
                        value={address}
                        style={{ width: "230px", height: "30px" }}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={handlePaste}
                        style={{ marginLeft: "10px" }}
                      >
                        Paste
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="send-button"
                      style={{
                        backgroundColor: "#7d9aea",
                        color: "white",
                        position: "relative",
                        height: "40px",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "30px",
                      }}
                    >
                      Proceed to Send
                    </button>
                  </form>
                </div>
              )}

              {selectedTab === "Convert" && (
                <div id="Convert" className="tab-content active">
                  <div className="wallet">
                    {console.log(selectedSymbol)}
                    {selectedSymbol === "tether" ? (
                      <form onSubmit={handleConvert}>
                        {/* <p>Convert USD to Another Cryptocurrency</p> */}
                        {showMessageModal && (
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
                              backgroundColor: "rgba(0, 0, 0, 0.4)",
                              zIndex: "1000",
                            }}
                          >
                            <div
                              className="modal-content"
                              style={{
                                backgroundColor: "#fefefe",
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
                              <span
                                className="close"
                                onClick={() => setShowMessageModal(false)}
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
                                    {modalIconColor === "red" && (
                                      <path
                                        d="M15.41 8.59L12 12l-3.41-3.41L7 10l5 5 5-5z"
                                        fill="red"
                                      />
                                    )}
                                  </svg>
                                </div>
                              </div>
                              <h2 style={{ color: "black" }}>{modalMessage}</h2>
                              <p>
                                {
                                  modalIconColor === "green"
                                  // ? "Your order has been successfully submitted."
                                }
                              </p>
                              <button
                                onClick={() => setShowMessageModal(false)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  padding: "10px",
                                  background:
                                    "linear-gradient(to right, #4caf50, #81c784)",
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

                        <div className="form-group">
                          <label>USDT Amount:</label>
                          <div
                            style={{
                              padding: "10px 10px 10px 10px",
                              display: "flex",
                            }}
                          >
                            <input
                              type="number"
                              value={usdtValue}
                              style={{ marginRight: "10px" }}
                              onChange={(e) => handleConvertAmountChange(e)}
                              required
                            />
                            <button type="button" onClick={handleMaxConvertUSD}>
                              Max
                            </button>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Select Cryptocurrency:</label>
                          <select
                            className="select11"
                            style={{
                              width: "90%",
                              height: "40px",
                              fontSize: "12px",
                            }}
                            value={selectedCrypto?.id || ""}
                            onChange={(e) =>
                              setSelectedCrypto(
                                cryptos.find(
                                  (crypto) => crypto.id === e.target.value
                                )
                              )
                            }
                            required
                          >
                            <option value="">Select...</option>
                            {cryptos.map((crypto) => (
                              <option key={crypto.id} value={crypto.id}>
                                {crypto.symbol.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="convert-button"
                          style={{ backgroundColor: "#7d9aea", color: "white" }}
                        >
                          Convert
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleConvertSubmit}>
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
                              backgroundColor: "rgba(0, 0, 0, 0.4)",
                              zIndex: "1000",
                            }}
                          >
                            <div
                              className="modal-content"
                              style={{
                                backgroundColor: "#fefefe",
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
                              <span
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
                              </span>
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
                                    {modalIconColor === "red" && (
                                      <path
                                        d="M15.41 8.59L12 12l-3.41-3.41L7 10l5 5 5-5z"
                                        fill="red"
                                      />
                                    )}
                                  </svg>
                                </div>
                              </div>
                              <h2 style={{ color: "black" }}>{modalMessage}</h2>
                              <button
                                onClick={() => setShowSuccessPopup(false)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  padding: "10px",
                                  background:
                                    "linear-gradient(to right, #4caf50, #81c784)",
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
                        <p>{selectedSymbol.toUpperCase()} / USDT</p>
                        {showMessageModal && (
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
                              backgroundColor: "rgba(0, 0, 0, 0.4)",
                              zIndex: "1000",
                            }}
                          >
                            <div
                              className="modal-content"
                              style={{
                                backgroundColor: "#fefefe",
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
                              <span
                                className="close"
                                onClick={() => setShowMessageModal(false)}
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
                                    {modalIconColor === "red" && (
                                      <path
                                        d="M15.41 8.59L12 12l-3.41-3.41L7 10l5 5 5-5z"
                                        fill="red"
                                      />
                                    )}
                                  </svg>
                                </div>
                              </div>
                              <h2 style={{ color: "black" }}>{modalMessage}</h2>
                              <p>
                                {modalIconColor === "green"
                                  ? "Your order has been successfully submitted."
                                  : "There was an error with your submission."}
                              </p>
                              <button
                                onClick={() => setShowMessageModal(false)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  padding: "10px",
                                  background:
                                    "linear-gradient(to right, #4caf50, #81c784)",
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

                        <div
                          className="form-group"
                          style={{
                            marginTop: "20px",
                            display: "flex",
                            justifyContent: "center",
                            textAlign: "center",
                            alignItems: "center",
                          }}
                        >
                          <label style={{ fontSize: "12px" }}>
                            USDT Amount
                          </label>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              textAlign: "center",
                              alignItems: "center",
                            }}
                          >
                            <input
                              style={{
                                height: "30px",
                                width: "150px",
                                marginLeft: "10px",
                                marginRight: "10px",
                              }}
                              type="number"
                              value={usdtValue}
                              onChange={(e) => handleConvertAmountChange(e)}
                              required
                            />
                            <button
                              type="button"
                              onClick={handleMaxConvertUSD}
                              style={{
                                marginRight: "25px",
                                marginBottom: "10px",
                              }}
                            >
                              Max
                            </button>
                          </div>
                        </div>
                        <div
                          className="form-group"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            textAlign: "center",
                            alignItems: "center",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "12px",
                              marginTop: "3px",
                              width: "50px",
                            }}
                          >
                            Asset Value
                          </label>
                          <input
                            style={{
                              height: "30px",
                              marginLeft: "15px",
                              width: "150px",
                            }}
                            type="number"
                            value={amount}
                            onChange={(e) => {
                              const value = e.target.value;
                              setAmount(value);
                              if (
                                walletData &&
                                walletData.prices &&
                                walletData.prices[selectedSymbol]?.usd !==
                                  undefined
                              ) {
                                const usdValue =
                                  value * walletData.prices[selectedSymbol].usd;
                                setUsdtValue(usdValue.toFixed(2));
                              }
                            }}
                            placeholder="0"
                            className="input-field small-input"
                            required
                          />
                          <button
                            type="button"
                            onClick={handleMaxConvertAssetValue}
                            style={{ marginRight: "10px", marginLeft: "10px" }}
                          >
                            Max
                          </button>
                        </div>
                        <div className="wallet-buttons">
                          <span className="currency-tag">To</span>
                          <span
                            className="currency"
                            style={{ marginRight: "2px" }}
                          >
                            USDT
                          </span>
                          <input
                            style={{
                              height: "30px",
                              marginLeft: "10px",
                              width: "100px",
                              marginRight: "30px",
                            }}
                            type="text"
                            value={usdtValue}
                            placeholder="0"
                            className="input-field small-input"
                            readOnly
                          />
                        </div>
                        <button
                          type="submit"
                          className="convert-button"
                          style={{ backgroundColor: "#7d9aea", color: "white" }}
                        >
                          Proceed to Convert
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showRechargeModal && (
        <div
          className="modal show"
          id="recharge-modal"
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
            // backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            id="recharggge"
            className="modal-content"
            style={{
              // backgroundColor: "#222e35",
              paddingTop: "10px",
              padding: "20px",
              border: "1px solid #888",
              width: "90%",
              maxWidth: "400px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              maxHeight: "87%", // Add maxHeight for scrolling
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            <span
              className="close"
              onClick={() => setShowRechargeModal(false)}
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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
                alignItems: "center",
              }}
            >
              <h2>{selectedSymbol.toUpperCase()} Recharge </h2>
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
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  zIndex: "1000",
                }}
              >
                <div
                  className="modal-content"
                  style={{
                    backgroundColor: "#fefefe",
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
                  <span
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
                  </span>
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
                        fill={modalIconColor}
                        width="80px"
                        height="80px"
                      >
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12s12-5.37 12-12C24 5.37 18.63 0 12 0zm0 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM10 17.2l-5.3-5.3 1.4-1.4 3.9 3.9 7.9-7.9 1.4 1.4L10 17.2z" />
                        {modalIconColor === "red" && (
                          <path
                            d="M15.41 8.59L12 12l-3.41-3.41L7 10l5 5 5-5z"
                            fill="red"
                          />
                        )}
                      </svg>
                    </div>
                  </div>
                  <h2 style={{ color: "black" }}>{modalMessage}</h2>
                  <button
                    onClick={() => {
                      setShowSuccessPopup(false);
                      setRechargeSuccessMessage(""); // Reset the message
                      setShowRechargeModal(false); // Close the modal
                    }}
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

            {/* The existing form content remains as it is */}
            {!showSuccessPopup && (
              <form onSubmit={handleRechargeSubmit} style={{ height: "500px" }}>
                {/* <div className="form-group">
                  <label>Currency</label>
                  <input
                    type="text"
                    value={selectedSymbol.toUpperCase()}
                    readOnly
                  />
                </div> */}
                <div className="form-group">
                  <label style={{ fontSize: "12px" }}>Network</label>
                  <input
                    type="text"
                    value={selectedSymbol.toUpperCase()}
                    readOnly
                    style={{ height: "30px" }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "12px" }}>Address</label>
                  <input
                    type="text"
                    value={walletInfo.walletAddress}
                    readOnly
                    style={{ height: "30px" }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "12px" }}>USDT Value:</label>
                  <input
                    type="number"
                    value={usdDepositAmount}
                    onChange={handleUsdDepositAmountChange}
                    required
                    style={{ height: "30px" }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "12px" }}>
                    {selectedSymbol.toUpperCase()} Amount:
                  </label>
                  <input
                    type="number"
                    value={cryptoDepositAmount}
                    onChange={handleCryptoDepositAmountChange}
                    required
                    style={{ height: "30px" }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: "12px" }}>Upload Screenshot</label>
                  <div
                    className="upload-screenshot"
                    onClick={() =>
                      document.getElementById("file-upload").click()
                    }
                  >
                    <span className="upload-icon">&#128247;</span>
                    <p id="upload-text" style={{ marginBottom: "20px" }}>
                      Upload Screenshot Here!
                    </p>
                    <img
                      id="uploaded-image"
                      style={{
                        display: "none",
                        maxWidth: "100%",
                        height: "auto",
                      }}
                      alt="uploaded"
                    />
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        document.getElementById("uploaded-image").src =
                          event.target.result;
                        document.getElementById(
                          "uploaded-image"
                        ).style.display = "block";
                        document.getElementById("upload-text").style.display =
                          "none";
                      };
                      reader.readAsDataURL(file);
                      setProof(file);
                    }}
                  />
                </div>
                <div style={{ padding: "0 0 10px 0" }}>
                  <button
                    type="submit"
                    className="submit-button"
                    style={{
                      backgroundColor: "#7d9aea",
                      color: "white",
                      position: "relative",
                      height: "40px",
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      // Centers content vertically
                    }}
                    disabled={isLoadingRecharge} // Disable the button when loading
                  >
                    {isLoadingRecharge && (
                      <div
                        className="loading-overlay"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          zIndex: 1000,
                        }}
                      >
                        <div
                          className="loading-spinner"
                          style={{
                            border: "4px solid #f3f3f3",
                            borderTop: "4px solid #3498db",
                            borderRadius: "50%",
                            width: "30px",
                            height: "30px",
                            animation: "spin 1s linear infinite",
                          }}
                        ></div>
                      </div>
                    )}
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {showLoginModal && <Login closeModal={() => setShowLoginModal(false)} />}
      {showSignupModal && (
        <SignupModal closeModal={() => setShowSignupModal(false)} />
      )}
      {!showRechargeModal && !showCryptoModal && !showSuccessPopup && (
        <Footer />
      )}
    </div>
  );
};

export default WalletDashboard;
