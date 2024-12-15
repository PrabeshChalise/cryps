const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const nodemailer = require("nodemailer");
const kycRoutes = require("./Routes/KycRoute");
const User = require("./models/User"); // Ensure this path is correct
const KYC = require("./models/KycModel");
// const Wallet = require("./models/Wallet"); // Ensure this path is correct
const cloudinary = require("cloudinary").v2;
const app = express();
const PORT = 3001;
const jwtSecret = process.env.JWT_SECRET;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { log } = require("console");

// // Proxy configuration for CoinGecko API
app.use(
  "/api/coingecko",
  createProxyMiddleware({
    target: "https://pro-api.coingecko.com",
    changeOrigin: true,
    pathRewrite: {
      "^/api/coingecko": "", // remove base path
    },
    headers: {
      "X-Cg-Pro-Api-Key": process.env.COINGECKO_API_KEY,
    },
  })
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    format: async (req, file) => "png", // supports promises as well
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});
const upload = multer({ storage });

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
// const Connection_url =
//   "mongodb+srv://prabesh:prabesh@fyp.ubddnoe.mongodb.net/Crypto?retryWrites=true&w=majority";

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch((error) => console.log(error.message));

mongoose.set("strictQuery", true);
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Use Hostinger's SMTP server
  port: 465, // Port for SSL
  secure: true, // Use SSL
  auth: {
    user: "support@trcnfx.com", // Your new email address
    pass: process.env.MAIL_PASS, // Your email password stored in environment variables
  },
});
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No such user found" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Use updateOne to update only the required fields
    await User.updateOne(
      { email },
      {
        $set: {
          verificationCode,
          verificationCodeExpires: Date.now() + 3600000, // 1 hour from now
        },
      }
    );

    const mailOptions = {
      from: "support@trcnfx.com", // New Hostinger email address
      to: user.email,
      subject: "Password Reset Verification Code",
      text: `Your verification code is ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      }
      res.json({ message: "Verification code sent to your email" });
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/fetch-image", async (req, res) => {
  const { imageUrl } = req.query;

  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    res.json({ image: base64 });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ message: "Failed to fetch image" });
  }
});

app.post("/api/verify-code", async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    res.json({ success: true, message: "Verification code is valid" });
  } catch (error) {
    console.error("Error in verify code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/verify/otp", async (req, res) => {
  const { email, otp } = req.body;
  console.log("Received request to verify OTP:", { email, otp });

  try {
    const user = await User.findOne({
      email: email,
      otp: otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Invalid or expired OTP");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // OTP is valid, save the user
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const data = {
      user: {
        id: user._id,
      },
    };
    const authToken = jwt.sign(data, jwtSecret);

    res.json({
      success: true,
      message: "OTP verified successfully",
      authToken,
      userdata: { _id: user._id, walletAddress: user.walletAddress },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No such user found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { email },
      {
        $set: { password: hashedPassword },
        $unset: { verificationCode: "", verificationCodeExpires: "" },
      }
    );

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Schema Definitions
const predictionSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  direction: { type: String, required: true },
  amount: { type: Number, required: true },
  deliveryTime: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  predictedAt: { type: Date, default: Date.now },
  fee: { type: Number, required: true },
  uid: { type: Number, required: true }, // Ensure uid is required here
  result: { type: Object, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  walletAddress: { type: String, required: true },
});

const Prediction = mongoose.model("Prediction", predictionSchema);

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  balances: {
    type: Map,
    of: Number,
    default: {
      usd: 0,
      bitcoin: 0,
      ethereum: 0,
      binancecoin: 0,
      usdCoin: 0,
      xrp: 0,
      toncoin: 0,
      cardano: 0,
      avalanche: 0,
      bitcoinCash: 0,
      polkadot: 0,
      dai: 0,
      lifecoin: 0,
      shibaInu: 0,
      solana: 0,
      lidoStakedEther: 0,
      wrappedBitcoin: 0,
      chainlink: 0,
      leoToken: 0,
    },
  },
});
const Wallet = mongoose.model("Wallet", walletSchema);
const WalletInfoSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  qrCodeUrl: { type: String, required: true },
  cryptoName: { type: String, required: true }, // Add this line
});

const WalletInfo = mongoose.model("WalletInfo", WalletInfoSchema);
// Wallet Info Routes
app.post(
  "/api/wallet-info/upload",
  upload.single("qrCode"),
  async (req, res) => {
    const { symbol, walletAddress, cryptoName } = req.body;
    const qrCodeUrl = req.file ? req.file.path : null;

    if (!symbol || !walletAddress || !qrCodeUrl || !cryptoName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    try {
      const existingWalletInfo = await WalletInfo.findOne({
        symbol: symbol.toUpperCase(),
      });
      if (existingWalletInfo) {
        existingWalletInfo.walletAddress = walletAddress;
        existingWalletInfo.qrCodeUrl = qrCodeUrl;
        existingWalletInfo.cryptoName = cryptoName;
        await existingWalletInfo.save();
        return res.json({ message: "Wallet info updated successfully." });
      }

      const newWalletInfo = new WalletInfo({
        symbol: symbol.toUpperCase(),
        walletAddress,
        qrCodeUrl,
        cryptoName,
      });
      await newWalletInfo.save();
      res.json({ message: "Wallet info added successfully." });
    } catch (error) {
      console.error("Error saving wallet info:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

app.get("/api/wallet-info/:symbol", async (req, res) => {
  const { symbol } = req.params;

  try {
    // Attempt to find the wallet info by symbol first
    let walletInfo = await WalletInfo.findOne({ symbol: symbol.toUpperCase() });

    // If not found, attempt to find by cryptoName
    if (!walletInfo) {
      walletInfo = await WalletInfo.findOne({ cryptoName: symbol });

      // If still not found, return a 404 error
      if (!walletInfo) {
        return res.status(404).json({ message: "Wallet info not found" });
      }
    }

    // Return the found wallet information
    res.json(walletInfo);
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/wallet-info", async (req, res) => {
  try {
    const walletInfos = await WalletInfo.find();
    res.json(walletInfos);
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: { type: Number, required: true },
    proof: { type: String, required: true },
    approved: { type: Boolean, default: false },
    selectedSymbol: { type: String, required: true },
    status: { type: String, default: "pending" }, // Set default status to pending
    uid: { type: String, required: true }, // Add uid field
  },
  { timestamps: true }
);

const Deposit = mongoose.model("Deposit", depositSchema);

const withdrawSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    symbol: { type: String, required: true },
    amount: { type: Number, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Withdraw = mongoose.model("Withdraw", withdrawSchema);
const messageSchema = new mongoose.Schema({
  clientId: String,
  message: String,
  reply: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);
app.get("/api/messages", async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});
app.post("/api/messages", async (req, res) => {
  const { clientId, message } = req.body;
  const newMessage = new Message({ clientId, message });
  await newMessage.save();
  res.status(201).send({ message: "Message sent successfully." });
});
app.get("/api/wallet/:userId/total-balance", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the wallet for the user
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found for this user" });
    }

    const balances = wallet.balances;

    // Map your symbols to CoinGecko-compatible IDs
    const symbolToIdMap = {
      bitcoin: "bitcoin",
      ethereum: "ethereum",
      tether: "tether",
      binancecoin: "binancecoin",
      solana: "solana",
      dogecoin: "dogecoin",
      "shiba-inu": "shiba-inu",
      // Add other mappings as needed
    };

    const nonZeroBalances = Object.entries(balances).filter(
      ([key, value]) => value > 0 && symbolToIdMap[key]
    );

    if (nonZeroBalances.length === 0) {
      return res.json({ totalUsdBalance: balances.usd || 0 });
    }

    // Prepare IDs for API call
    const ids = nonZeroBalances.map(([key]) => symbolToIdMap[key]).join(",");

    // Fetch prices from CoinGecko
    const response = await axios.get(
      "https://pro-api.coingecko.com/api/v3/simple/price",
      {
        params: { ids, vs_currencies: "usd" },
        headers: { "X-Cg-Pro-Api-Key": process.env.COINGECKO_API_KEY },
      }
    );

    const prices = response.data;

    // Calculate total USD equivalent
    let totalUsdBalance = balances.usd || 0;
    nonZeroBalances.forEach(([key, value]) => {
      const coinId = symbolToIdMap[key];
      const price = prices[coinId]?.usd || 0;
      totalUsdBalance += value * price;
    });
    console.log("User ID:", userId);
    console.log("Wallet:", wallet);
    console.log("Non-Zero Balances:", nonZeroBalances);
    console.log("Prices from CoinGecko:", prices);
    console.log("Total USD Balance:", totalUsdBalance);

    res.json({ totalUsdBalance });
  } catch (error) {
    console.error("Error calculating total balance:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Admin replies to a message
app.put("/api/messages/:id", async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  await Message.findByIdAndUpdate(id, { reply });
  res.send({ message: "Reply sent successfully." });
});

const conversionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    fromSymbol: { type: String, required: true },
    toSymbol: { type: String, required: true },
    amount: { type: Number, required: true },
    convertedAmount: { type: Number, required: true },
    status: { type: String, default: "completed" }, // Set default status to completed
  },
  { timestamps: true }
);

const Conversion = mongoose.model("Conversion", conversionSchema);

const fetchCryptoPrice = async (symbol) => {
  try {
    const response = await axios.get(
      `https://pro-api.coingecko.com/api/v3/simple/price`,
      {
        params: { ids: symbol, vs_currencies: "usd" },
        headers: {
          "X-Cg-Pro-Api-Key": process.env.COINGECKO_API_KEY,
        },
      }
    );
    return response.data[symbol].usd;
  } catch (error) {
    console.error("Error fetching price for", symbol, ":", error);
    throw new Error("Failed to fetch crypto price");
  }
};

// app.post("/api/convert", async (req, res) => {
//   const { userId, fromSymbol, toSymbol, amount } = req.body;

//   try {
//     const wallet = await Wallet.findOne({ userId });
//     if (!wallet || wallet.balances.get(fromSymbol.toLowerCase()) < amount) {
//       return res.status(400).json({ error: "Insufficient balance." });
//     }

//     const cryptoPrice = await fetchCryptoPrice(toSymbol.toLowerCase());
//     const cryptoAmount = amount / cryptoPrice;

//     wallet.balances.set(
//       fromSymbol.toLowerCase(),
//       wallet.balances.get(fromSymbol.toLowerCase()) - amount
//     );

//     if (!wallet.balances.get(toSymbol.toLowerCase())) {
//       wallet.balances.set(toSymbol.toLowerCase(), 0);
//     }

//     wallet.balances.set(
//       toSymbol.toLowerCase(),
//       wallet.balances.get(toSymbol.toLowerCase()) + cryptoAmount
//     );

//     await wallet.save();

//     const conversion = new Conversion({
//       userId,
//       fromSymbol,
//       toSymbol,
//       amount,
//       convertedAmount: cryptoAmount,
//       status: "completed",
//     });

//     await conversion.save();

//     res.json({ success: true, balances: wallet.balances });
//   } catch (error) {
//     console.error("Error during conversion:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

app.get("/api/transactions/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 });
    const sends = await Send.find({ userId }).sort({ createdAt: -1 });
    const withdraws = await Withdraw.find({ userId }).sort({ createdAt: -1 });
    const conversions = await Conversion.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({ deposits, sends, withdraws, conversions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const sendSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    symbol: { type: String, required: true },
    amount: { type: Number, required: true },
    address: { type: String, required: true },
    status: { type: String, default: "pending" }, // Set default status to pending
  },
  { timestamps: true }
);

const Send = mongoose.model("Send", sendSchema);

const deliveryTimes = [
  { time: 60, interest: 0.1, minAmount: 50 },
  { time: 120, interest: 0.35, minAmount: 1000 },
  { time: 129600, interest: 2.15, minAmount: 50000 },
  { time: 604800, interest: 3.15, minAmount: 100000 },
  { time: 2592000, interest: 5.2, minAmount: 200000 },
];

// Routes
app.get("/api/prices", async (req, res) => {
  try {
    const response = await axios.get(
      "https://pro-api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 250,
          page: 1,
          sparkline: true,
        },
        headers: {
          "X-Cg-Pro-Api-Key": process.env.COINGECKO_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching prices:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 });
    const sends = await Send.find({ userId }).sort({ createdAt: -1 });
    const withdraws = await Withdraw.find({ userId }).sort({ createdAt: -1 });
    const conversions = await Conversion.find({ userId }).sort({
      createdAt: -1,
    });

    // Add transactionType to distinguish between deposit, send, withdraw, and conversion
    const formattedDeposits = deposits.map((deposit) => ({
      ...deposit.toObject(),
      transactionType: "deposit",
    }));

    const formattedSends = sends.map((send) => ({
      ...send.toObject(),
      transactionType: "send",
    }));

    const formattedConversions = conversions.map((conversion) => ({
      ...conversion.toObject(),
      transactionType: "conversion",
    }));

    res.json({
      deposits: formattedDeposits,
      sends: formattedSends,
      conversions: formattedConversions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New route to fetch transaction details by ID
app.get("/api/transaction/:id", async (req, res) => {
  const { id } = req.params;

  try {
    let transaction = await Deposit.findById(id);
    if (transaction) {
      return res.json({ ...transaction.toObject(), type: "deposit" });
    }

    transaction = await Send.findById(id);
    if (transaction) {
      return res.json({ ...transaction.toObject(), type: "send" });
    }

    transaction = await Withdraw.findById(id);
    if (transaction) {
      return res.json({ ...transaction.toObject(), type: "withdraw" });
    }

    transaction = await Conversion.findById(id);
    if (transaction) {
      return res.json({ ...transaction.toObject(), type: "conversion" });
    }

    return res.status(404).json({ error: "Transaction not found" });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/predict", async (req, res) => {
  const {
    symbol,
    direction,
    amount,
    deliveryTime,
    uid,
    userId,
    walletAddress,
  } = req.body;

  const selectedTime = deliveryTimes.find((time) => time.time === deliveryTime);

  if (!selectedTime) {
    return res.status(400).json({ error: "Invalid delivery time selected." });
  }

  if (amount < selectedTime.minAmount) {
    return res.status(400).json({
      error: `Minimum amount for this order is ${selectedTime.minAmount} USDT`,
    });
  }

  // Fetch wallet based on USDT balance
  const wallet = await Wallet.findOne({ userId });

  if (!wallet || wallet.balances.get("tether") < amount) {
    return res.status(400).json({ error: "Insufficient USDT balance." });
  }

  const prediction = new Prediction({
    symbol,
    direction,
    amount,
    deliveryTime,
    currentPrice: await fetchCryptoPrice(symbol),
    predictedAt: Date.now(),
    fee: amount * 0.001,
    uid,
    userId,
    walletAddress,
  });

  try {
    // Deduct USDT balance after the prediction is made
    wallet.balances.set("tether", wallet.balances.get("tether") - amount);
    await wallet.save();
    await prediction.save();

    setTimeout(async () => {
      try {
        const result = await evaluatePrediction(
          prediction._id,
          selectedTime.interest
        );
        console.log("Evaluation result:", result);
      } catch (error) {
        console.error("Error evaluating prediction:", error);
      }
    }, deliveryTime * 1000);

    res.json(prediction);
  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({ error: error.message });
  }
});

const evaluatePrediction = async (predictionId, interestRate) => {
  const prediction = await Prediction.findById(predictionId);
  if (!prediction) throw new Error("Prediction not found");

  const { amount, fee, result, userId } = prediction;

  const user = await User.findById(userId);

  // Check for user default trade result
  if (user.defaultTradeResult) {
    const isSuccess = user.defaultTradeResult === "win";
    const profit = isSuccess ? (amount - fee) * interestRate : 0;
    const totalProfit = isSuccess ? amount - fee + profit : 0;

    const evalResult = {
      success: isSuccess,
      profit,
      totalProfit,
      message: isSuccess
        ? `Admin approved profit of ${profit} USDT`
        : "Admin approved loss",
    };

    if (isSuccess) {
      await Wallet.updateOne(
        { userId },
        { $inc: { "balances.tether": totalProfit } }
      );
    }

    await Prediction.findByIdAndUpdate(predictionId, { result: evalResult });
    return evalResult;
  }

  // If no admin or user default result, set to loss
  const evalResult = {
    success: false,
    loss: amount,
    message: "You have lost all your money",
  };

  await Prediction.findByIdAndUpdate(predictionId, { result: evalResult });
  return evalResult;
};

app.get("/api/clients1", async (req, res) => {
  try {
    const clients = await User.find({ agentId: null }, "_id email userId"); // Fetch only clients without an assigned agent
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/clients", async (req, res) => {
  try {
    const clients = await User.find({}, "_id email userId agentUID createdAt"); // Fetch only the required fields
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/wallets", async (req, res) => {
  try {
    const wallets = await Wallet.find().lean(); // Use lean() for better performance
    const userIds = wallets.map((wallet) => wallet.userId);
    const users = await User.find({ _id: { $in: userIds } }, "userId").lean();
    const userMap = users.reduce((map, user) => {
      map[user._id] = user.userId;
      return map;
    }, {});

    const walletsWithUserIds = wallets.map((wallet) => ({
      ...wallet,
      userId: userMap[wallet.userId],
    }));

    res.json(walletsWithUserIds);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json({ email: user.email });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/users/:id/default-trade-result", async (req, res) => {
  const { id } = req.params;
  const { defaultTradeResult } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { defaultTradeResult },
      { new: true }
    );
    res.json({ message: "Default trade result updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});
app.get("/api/users/:userId/default-trade-result", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ defaultTradeResult: user.defaultTradeResult });
  } catch (error) {
    console.error("Error fetching default trade result:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/wallet/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Wallet.findByIdAndDelete(id);
    res.json({ message: "Wallet deleted successfully" });
  } catch (error) {
    console.error("Error deleting wallet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Modify your backend route to fetch only pending deposits for the admin's agents
// Modify your backend route to fetch pending deposits for the agents under the logged-in admin
app.get("/api/deposits-for-admin/:adminId", async (req, res) => {
  const { adminId } = req.params;

  try {
    // Find the admin by their adminId to get the admin name
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const adminName = admin.name;

    // Find agents under the logged-in admin's team (adminName)
    const agents = await Agent.find({ team: adminName });

    // Extract the agent IDs
    const agentIds = agents.map((agent) => agent._id);

    // Find users who are assigned to those agents
    const clients = await User.find({ agentId: { $in: agentIds } });

    // Extract the client IDs
    const clientIds = clients.map((client) => client._id);

    // Fetch only the pending deposits for those clients
    const deposits = await Deposit.find({
      userId: { $in: clientIds },
      approved: false, // Fetch only pending deposits
    }).populate("userId", "userId agentUID"); // Populate userId and agentUID for better details

    res.json(deposits);
  } catch (error) {
    console.error("Error fetching pending deposits for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// New backend route to fetch deposits for clients assigned to a specific agent
app.get("/api/deposits-for-agent/:agentId", async (req, res) => {
  const { agentId } = req.params;

  try {
    // Find clients assigned to the given agentId
    const clients = await User.find({ agentId }).select("_id");

    const clientIds = clients.map((client) => client._id);

    // Fetch pending deposits for those clients
    const deposits = await Deposit.find({
      userId: { $in: clientIds },
      approved: false, // Fetch only pending deposits
    }).populate("userId", "userId agentUID"); // Populate userId and agentUID for better details

    res.json(deposits);
  } catch (error) {
    console.error("Error fetching deposits for agent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API route to fetch send requests for the agents under the logged-in admin
app.get("/api/send-requests-for-admin/:adminId", async (req, res) => {
  const { adminId } = req.params;

  try {
    // Find the admin by their adminId to get the admin name
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const adminName = admin.name;

    // Find agents under the logged-in admin's team (adminName)
    const agents = await Agent.find({ team: adminName });

    // Extract the agent IDs
    const agentIds = agents.map((agent) => agent._id);

    // Find users who are assigned to those agents
    const clients = await User.find({ agentId: { $in: agentIds } });

    // Extract the client IDs
    const clientIds = clients.map((client) => client._id);

    // Fetch only the pending send requests for those clients
    const sendRequests = await Send.find({
      userId: { $in: clientIds },
      status: "pending", // Fetch only pending send requests
    }).populate("userId", "userId agentUID"); // Populate userId and agentUID for better details

    res.json(sendRequests);
  } catch (error) {
    console.error("Error fetching send requests for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/deposits/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deposit = await Deposit.findById(id);
    if (!deposit) {
      console.error(`Deposit with id ${id} not found`);
      return res.status(404).json({ error: "Deposit not found" });
    }

    await Deposit.findByIdAndDelete(id); // Use findByIdAndDelete instead of remove
    res.json({ message: "Deposit declined and deleted successfully" });
  } catch (error) {
    console.error(`Error declining deposit with id ${id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/clients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/prediction/:id/result", async (req, res) => {
  const { id } = req.params;
  const { success } = req.body;

  try {
    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }

    let profit = 0;
    let totalProfit = 0;
    let resultMessage = "Admin approved loss";

    if (success) {
      profit = (prediction.amount - prediction.fee) * 0.1; // Only profit amount
      totalProfit = prediction.amount - prediction.fee + profit; // Total amount after profit
      resultMessage = `Admin approved profit of ${profit} USD`;
    }

    const result = {
      success,
      amount: prediction.amount,
      profit,
      totalProfit,
      message: resultMessage,
    };

    await Prediction.findByIdAndUpdate(id, { result });

    await Wallet.updateOne(
      { userId: prediction.userId },
      {
        $inc: {
          "balances.usd": success ? totalProfit : 0,
        },
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating prediction result:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/prediction/:id", async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction)
      return res.status(404).json({ error: "Prediction not found" });
    res.json(prediction);
  } catch (error) {
    console.error("Error fetching prediction result:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/predictions", async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ predictedAt: -1 });
    res.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ error: error.message });
  }
});

// app.get("/api/predictions/user/:userId", async (req, res) => {
//   try {
//     const predictions = await Prediction.find({ userId: req.params.userId });
//     if (!predictions.length)
//       return res
//         .status(404)
//         .json({ error: "No predictions found for this user" });
//     res.json(predictions);
//   } catch (error) {
//     console.error("Error fetching predictions:", error);
//     res.status(500).json({ error: error.message });
//   }
// });
app.get("/api/predictions/user/:userId", async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.params.userId });
    res.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/predictions/waiting", async (req, res) => {
  try {
    const predictions = await Prediction.find({ result: null });
    res.json(predictions);
  } catch (error) {
    console.error("Error fetching waiting predictions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Wallet Routes
app.post("/api/wallet", async (req, res) => {
  const { userId, symbol, amount } = req.body;

  try {
    await Wallet.updateOne(
      { userId },
      { $set: { [`balances.${symbol}`]: amount } },
      { upsert: true }
    );
    res.json({ success: true, message: "Wallet balance updated successfully" });
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/cryptos", async (req, res) => {
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
          "X-Cg-Pro-Api-Key": process.env.COINGECKO_API_KEY,
        },
      }
    );
    // res.send(response);
    // console.log(response);
    const cryptos = response.data.map((crypto) => ({
      id: crypto.id,
      symbol: crypto.symbol.toUpperCase(),
      name: crypto.name,
      logo: crypto.image,
    }));
    res.json(cryptos);
  } catch (error) {
    console.error("Error fetching cryptocurrencies:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/agent-uid-by-user-id/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("agentUID");
    if (!user) {
      console.log(`User with userId ${userId} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.agentUID) {
      console.log(`Agent UID not assigned for userId ${_id}`);
      return res.status(404).json({ message: "Agent UID not assigned" });
    }

    res.json({ agentUID: user.agentUID });
  } catch (error) {
    console.error("Error fetching agent UID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/wallets/:userId", async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found for this user" });
    }

    // Fetch prices for the coins the user holds
    const symbols = Array.from(wallet.balances.keys());
    const response = await axios.get(
      "https://pro-api.coingecko.com/api/v3/simple/price",
      {
        params: { ids: symbols.join(","), vs_currencies: "usd" },
        headers: {
          "X-Cg-Pro-Api-Key": process.env.COINGECKO_API_KEY,
        },
      }
    );

    const prices = response.data;

    // Convert tether balance to USD equivalent
    const tetherBalance = wallet.balances.get("tether");
    if (tetherBalance !== undefined) {
      // Replace tether balance with usd balance
      wallet.balances.set("tether", wallet.balances.get("usd"));
    }

    res.json({ balances: wallet.balances, prices });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/wallets/:userId", async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found for this user" });
    }

    // Replace tether balance with USDT balance for all operations
    const tetherBalance = wallet.balances.get("tether") || 0;

    res.json({ balances: wallet.balances, tetherBalance });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/convert", async (req, res) => {
  const { userId, fromSymbol, toSymbol, amount } = req.body;

  try {
    const wallet = await Wallet.findOne({ userId });
    console.log(userId, fromSymbol, toSymbol, amount);
    if (!wallet || wallet.balances.get(fromSymbol.toLowerCase()) < amount) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Fetch prices for both fromSymbol and toSymbol
    const fromCryptoPrice = await fetchCryptoPrice(fromSymbol.toLowerCase());
    const toCryptoPrice = await fetchCryptoPrice(toSymbol.toLowerCase());

    if (!fromCryptoPrice || !toCryptoPrice) {
      return res.status(400).json({ error: "Error fetching crypto prices." });
    }

    // Calculate the equivalent amount in the target cryptocurrency (toSymbol)
    const cryptoAmount = (amount * fromCryptoPrice) / toCryptoPrice;

    // Deduct the amount from the source balance (handle USDT as "tether")
    if (
      fromSymbol.toLowerCase() === "usd" ||
      fromSymbol.toLowerCase() === "tether"
    ) {
      const tetherBalance = wallet.balances.get("tether") || 0;
      if (tetherBalance < amount) {
        return res.status(400).json({ error: "Insufficient tether balance." });
      }
      wallet.balances.set("tether", tetherBalance - amount);
    } else {
      const fromBalance = wallet.balances.get(fromSymbol.toLowerCase()) || 0;
      wallet.balances.set(fromSymbol.toLowerCase(), fromBalance - amount);
    }

    // Add the converted amount to the destination balance
    if (
      toSymbol.toLowerCase() === "usd" ||
      toSymbol.toLowerCase() === "tether"
    ) {
      const tetherBalance = wallet.balances.get("tether") || 0;
      wallet.balances.set("tether", tetherBalance + cryptoAmount);
    } else {
      const toBalance = wallet.balances.get(toSymbol.toLowerCase()) || 0;
      wallet.balances.set(toSymbol.toLowerCase(), toBalance + cryptoAmount);
    }

    await wallet.save();

    const conversion = new Conversion({
      userId,
      fromSymbol,
      toSymbol,
      amount,
      convertedAmount: cryptoAmount,
      status: "completed",
    });

    await conversion.save();

    res.json({ success: true, balances: wallet.balances });
  } catch (error) {
    console.error("Error during conversion:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/wallet/:userId/balances", async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.params.userId });

    if (!wallet) {
      const response = await axios.get(
        "https://pro-api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 250,
            page: 1,
            sparkline: true,
          },
          headers: {
            "X-Cg-Pro-Api-Key": process.env.COINGECKO_API_KEY,
          },
        }
      );

      const coins = response.data;
      const initialBalances = { usd: 0 };
      coins.forEach((coin) => {
        initialBalances[coin.id] = 0;
      });

      wallet = new Wallet({
        userId: req.params.userId,
        balances: initialBalances,
      });
      await wallet.save();
    }

    const symbols = Array.from(wallet.balances.keys());
    if (!symbols.length) {
      return res.json({ balances: wallet.balances, prices: {} });
    }

    const response = await axios.get(
      "https://pro-api.coingecko.com/api/v3/simple/price",
      {
        params: { ids: symbols.join(","), vs_currencies: "usd" },
        headers: {
          "X-Cg-Pro-Api-Key": process.env.COINGECKO_API_KEY,
        },
      }
    );

    const prices = response.data;
    res.json({ balances: wallet.balances, prices });
  } catch (error) {
    console.error("Error fetching wallet balances and prices:", error);
    res.status(500).json({ error: error.message });
  }
});

// // Multer configuration for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

app.post("/api/deposit", upload.single("proof"), async (req, res) => {
  const { userId, amount, selectedSymbol } = req.body;
  const proof = req.file ? req.file.path : null;
  const uid = req.body.uid; // Add this line to get the UID from the request body

  if (!proof) {
    console.error("Proof of payment file is missing.");
    return res.status(400).json({ error: "Proof of payment is required." });
  }

  const deposit = new Deposit({ userId, amount, proof, selectedSymbol, uid }); // Add uid here

  try {
    await deposit.save();
    res.json({
      success: true,
      message: "Deposit request submitted successfully",
    });
  } catch (error) {
    console.error("Error saving deposit request:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/deposits", async (req, res) => {
  try {
    const deposits = await Deposit.find({ approved: false }).populate(
      "userId",
      "userId agentUID"
    ); // Populate userId and agentUID
    res.json(deposits);
  } catch (error) {
    console.error("Error fetching deposits:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/deposits/:id/approve", async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    const deposit = await Deposit.findById(id);
    if (!deposit) return res.status(404).json({ error: "Deposit not found" });

    const wallet = await Wallet.findOne({ userId: deposit.userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    deposit.approved = true;
    deposit.amount = amount; // Update the amount in the deposit
    await deposit.save();

    const symbol = deposit.selectedSymbol.toLowerCase();

    // Update Tether balance
    if (!wallet.balances.get(symbol)) {
      wallet.balances.set(symbol, 0);
    }
    wallet.balances.set(
      symbol,
      wallet.balances.get(symbol) + parseFloat(amount)
    );

    // Update USD balance if symbol is Tether (USDT)
    if (symbol === "tether") {
      if (!wallet.balances.get("usd")) {
        wallet.balances.set("usd", 0);
      }
      wallet.balances.set(
        "usd",
        wallet.balances.get("usd") + parseFloat(amount)
      );
    }

    await wallet.save();

    res.json({
      success: true,
      message: "Deposit approved and balances updated",
    });
  } catch (error) {
    console.error("Error approving deposit:", error);
    res.status(500).json({ error: error.message });
  }
});

// New route to update the status of the deposit to "completed"
app.post("/api/deposits/:id/complete", async (req, res) => {
  const { id } = req.params;

  try {
    const deposit = await Deposit.findById(id);
    if (!deposit) return res.status(404).json({ error: "Deposit not found" });

    deposit.status = "completed"; // Update the status to completed
    await deposit.save();

    res.json({
      success: true,
      message: "Deposit status updated to completed",
    });
  } catch (error) {
    console.error("Error updating deposit status:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/withdraw", async (req, res) => {
  const { userId, symbol, amount } = req.body;

  try {
    // Find the user's wallet
    const wallet = await Wallet.findOne({ userId });
    if (
      !wallet ||
      !wallet.balances.get(symbol.toLowerCase()) ||
      wallet.balances.get(symbol.toLowerCase()) < amount
    ) {
      return res
        .status(400)
        .json({ error: "Insufficient balance for withdrawal" });
    }

    // Deduct the amount from the wallet (as it's already done)
    const newBalance = wallet.balances.get(symbol.toLowerCase()) - amount;
    wallet.balances.set(symbol.toLowerCase(), newBalance);

    // Store the frozen amount for withdrawal
    const frozenAmount = new FrozenAmount({
      userId,
      symbol: symbol.toUpperCase(),
      amount: amount,
    });
    await frozenAmount.save();

    await wallet.save();

    res.json({
      success: true,
      message: "Withdrawal requested and amount frozen",
      frozenAmount,
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ error: error.message });
  }
});
const frozenAmountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FrozenAmount = mongoose.model("FrozenAmount", frozenAmountSchema);

app.post("/api/send", async (req, res) => {
  const { userId, symbol, amount, address } = req.body;

  try {
    const wallet = await Wallet.findOne({ userId });
    const currentBalance = wallet.balances.get(symbol.toLowerCase());

    if (!wallet || currentBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct the amount from the wallet
    wallet.balances.set(symbol.toLowerCase(), currentBalance - amount);
    await wallet.save();

    // Update or create the frozen amount
    await FrozenAmount.findOneAndUpdate(
      { userId, symbol },
      { $inc: { amount: amount } }, // Increment the existing amount
      { upsert: true, new: true } // Create a new document if not found
    );

    // Create send request
    const sendRequest = new Send({
      userId,
      symbol,
      amount,
      address,
      status: "pending",
    });
    await sendRequest.save();

    res.json({
      success: true,
      message: "Send request submitted and amount frozen",
    });
  } catch (error) {
    console.error("Error creating send request:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/send-requests", async (req, res) => {
  try {
    const sendRequests = await Send.find({ status: "pending" });
    res.json(sendRequests);
  } catch (error) {
    console.error("Error fetching send requests:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/send-requests/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const sendRequest = await Send.findById(id);
    if (!sendRequest) {
      return res.status(404).json({ error: "Send request not found" });
    }

    const { userId, symbol, amount } = sendRequest;

    if (status === "complete") {
      // Find the frozen amount for the user and symbol
      const frozenAmountEntry = await FrozenAmount.findOne({ userId, symbol });

      if (!frozenAmountEntry || frozenAmountEntry.amount < amount) {
        return res.status(400).json({ error: "Insufficient frozen amount" });
      }

      // Deduct the approved amount from the frozen amount
      frozenAmountEntry.amount -= amount;
      if (frozenAmountEntry.amount <= 0) {
        await FrozenAmount.deleteOne({ userId, symbol });
      } else {
        await frozenAmountEntry.save();
      }

      // Finalize the send request as completed
      sendRequest.status = "complete";
      await sendRequest.save();

      res.json({ success: true, message: `Send request marked as ${status}` });
    } else if (status === "incomplete") {
      // Refund the frozen amount back to the user's wallet
      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
        wallet.balances.set(
          symbol.toLowerCase(),
          wallet.balances.get(symbol.toLowerCase()) + amount
        );
        await wallet.save();

        // Remove the frozen amount entry (or reduce it)
        const frozenAmountEntry = await FrozenAmount.findOne({
          userId,
          symbol,
        });
        if (frozenAmountEntry) {
          frozenAmountEntry.amount -= amount;
          if (frozenAmountEntry.amount <= 0) {
            await FrozenAmount.deleteOne({ userId, symbol });
          } else {
            await frozenAmountEntry.save();
          }
        }
      }

      // Update the send request status
      sendRequest.status = "incomplete";
      await sendRequest.save();

      res.json({ success: true, message: `Send request marked as ${status}` });
    }
  } catch (error) {
    console.error("Error updating send request status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Function to generate a random 6-digit user ID
const generateUserId = async () => {
  let userId;
  let userExists;
  do {
    userId = Math.floor(100000 + Math.random() * 900000).toString();
    userExists = await User.findOne({ userId });
  } while (userExists);
  return userId;
};

// Function to generate a random 12-character wallet address
const generateWalletAddress = async () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let walletAddress;
  let addressExists;
  do {
    walletAddress = "";
    for (let i = 0; i < 12; i++) {
      walletAddress += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    addressExists = await User.findOne({ walletAddress });
  } while (addressExists);
  return walletAddress;
};

app.post(
  "/api/register/createuser",
  body("email", "Invalid email").isEmail(),
  body("password", "Password too short").isLength({ min: 5 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ success: false, userExist: true });
      }

      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(req.body.password, salt);

      const userId = await generateUserId();
      const walletAddress = await generateWalletAddress();

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Create user object and save it
      const user = new User({
        email: req.body.email,
        password: securePassword,
        userId: userId,
        walletAddress: walletAddress,
        otp: otp, // Save OTP
        otpExpires: Date.now() + 3600000, // 1 hour expiration
      });

      await user.save(); // Save user data to the database

      const logoPath = path.join(__dirname, "logo2.png");

      const mailOptions = {
        from: "support@trcnfx.com",
        to: user.email,
        subject: "Thank you for signing up!",
        html: `
          <div style="text-align: center;">
            <h3>Thank you for signing up!</h3>
            <img src="cid:unique@logo2.png" style="width: 400px; height: auto;" />
            <p>Your OTP code is ${otp}</p>
          </div>
        `,
        attachments: [
          {
            filename: "logo2.png",
            path: logoPath,
            cid: "unique@logo2.png",
          },
        ],
      };

      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          await User.deleteOne({ _id: user._id }); // Delete user data if email fails
          return res.status(500).json({ message: "Error sending email" });
        } else {
          console.log("Email sent: " + info.response);
          res.json({
            success: true,
            userExist: false,
            userdata: {
              email: user.email,
              userId: user.userId,
              walletAddress: user.walletAddress,
              otp: otp,
            },
          });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.use("/api/register", require("./Routes/Signup"));
app.use("/api", kycRoutes);
app.get("/api/kyc", async (req, res) => {
  try {
    const kycRequests = await KYC.find({ status: "pending" });
    res.json(kycRequests);
  } catch (error) {
    console.error("Error fetching KYC requests:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/kyc/:id/approve", async (req, res) => {
  const { id } = req.params;

  try {
    await KYC.findByIdAndUpdate(id, { status: "approved" });
    res.json({ success: true, message: "KYC approved successfully" });
  } catch (error) {
    console.error("Error approving KYC:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/kyc/:id/reject", async (req, res) => {
  const { id } = req.params;

  try {
    await KYC.findByIdAndUpdate(id, { status: "rejected" });
    res.json({ success: true, message: "KYC rejected successfully" });
  } catch (error) {
    console.error("Error rejecting KYC:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post(
  "/api/kyc",
  upload.fields([
    { name: "identityProof", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  async (req, res) => {
    const { userId, dob, country, address, zip, contact } = req.body;

    if (!req.files["identityProof"] || !req.files["photo"]) {
      return res
        .status(400)
        .json({ error: "Identity proof and photo are required." });
    }

    try {
      const identityProof = await cloudinary.uploader.upload(
        req.files["identityProof"][0].path,
        { folder: "kyc" }
      );

      const photo = await cloudinary.uploader.upload(
        req.files["photo"][0].path,
        {
          folder: "kyc",
        }
      );

      const kycData = new KYC({
        userId,
        dob,
        country,
        address,
        zip,
        contact,
        identityProof: identityProof.secure_url,
        photo: photo.secure_url,
        status: "pending",
      });

      await kycData.save();
      res.json({ success: true, message: "KYC submitted successfully" });
    } catch (error) {
      console.error("Error saving KYC data:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

app.get("/api/kyc/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const kyc = await KYC.findOne({ userId });
    if (!kyc) {
      return res.status(404).json({ error: "KYC not found" });
    }
    res.json(kyc);
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: error.message });
  }
});
const agentSchema = new mongoose.Schema({
  agentId: { type: String, unique: true },
  name: { type: String, unique: true },
  team: String,
  password: String,
  date: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false },
  noOfClients: { type: Number, default: 0 }, // New field
  clientIds: { type: [String], default: [] }, // New field
});

const Agent = mongoose.model("Agent", agentSchema);

// Helper functions
const generateAgentId = async () => {
  let agentId;
  let agentExists;
  do {
    agentId = `AG${Math.floor(1000 + Math.random() * 9000)}`;
    agentExists = await Agent.findOne({ agentId });
  } while (agentExists);
  return agentId;
};
const loanApplicationSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  repaymentPeriod: { type: String, required: true },
  dailyInterestRate: { type: Number, required: true },
  feeRate: { type: Number, required: true },
  handlingFee: { type: Number, required: true },
  houseInfo: { type: String, required: true },
  proofOfIncome: { type: String, required: true },
  bankDetails: { type: String, required: true },
  idPhoto: { type: String, required: true },
  uid: { type: String, required: true }, // Added uid field
  userId: { type: String, required: true }, // Added userId field
});

const LoanApplication = mongoose.model(
  "LoanApplication",
  loanApplicationSchema
);

app.post(
  "/api/apply-loan",
  upload.fields([
    { name: "houseInfo", maxCount: 1 },
    { name: "proofOfIncome", maxCount: 1 },
    { name: "bankDetails", maxCount: 1 },
    { name: "idPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    const {
      amount,
      repaymentPeriod,
      dailyInterestRate,
      feeRate,
      handlingFee,
      uid,
      userId,
    } = req.body;

    const houseInfo = req.files.houseInfo[0].path;
    const proofOfIncome = req.files.proofOfIncome[0].path;
    const bankDetails = req.files.bankDetails[0].path;
    const idPhoto = req.files.idPhoto[0].path;

    const loanApplication = new LoanApplication({
      amount,
      repaymentPeriod,
      dailyInterestRate,
      feeRate,
      handlingFee,
      houseInfo,
      proofOfIncome,
      bankDetails,
      idPhoto,
      uid, // Store uid
      userId, // Store userId
    });

    try {
      await loanApplication.save();
      res
        .status(201)
        .json({ message: "Loan application submitted successfully" });
    } catch (error) {
      console.error("Error saving loan application:", error);
      res.status(500).json({ error: "Failed to submit loan application" });
    }
  }
);
app.get("/api/loan-applications", async (req, res) => {
  try {
    const loanApplications = await LoanApplication.find();
    res.json(loanApplications);
  } catch (error) {
    console.error("Error fetching loan applications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/loan-applications/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await LoanApplication.findByIdAndDelete(id);
    res.json({ message: "Loan application deleted successfully" });
  } catch (error) {
    console.error("Error deleting loan application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/profit-stats/:userId", async (req, res) => {
  const { userId } = req.params;
  const { period } = req.query;

  const periods = {
    "1H": 60 * 60 * 1000,
    "6H": 6 * 60 * 60 * 1000,
    "1D": 24 * 60 * 60 * 1000,
    "1W": 7 * 24 * 60 * 60 * 1000,
    "1M": 30 * 24 * 60 * 60 * 1000,
  };

  const currentTime = new Date();
  const pastTime = new Date(currentTime - periods[period]);

  try {
    const predictions = await Prediction.find({
      userId,
      predictedAt: { $gte: pastTime },
    });

    if (!predictions.length) {
      return res.status(404).json({ error: `No data found for ${period}` });
    }

    const totalProfit = predictions.reduce(
      (acc, pred) =>
        acc + (pred.result && pred.result.success ? pred.result.profit : 0),
      0
    );
    const totalLoss = predictions.reduce(
      (acc, pred) =>
        acc + (pred.result && !pred.result.success ? pred.result.loss : 0),
      0
    );
    const netProfitLoss = totalProfit - totalLoss;
    const tradingVolume = predictions.reduce(
      (acc, pred) => acc + pred.amount,
      0
    );

    res.json({
      predictions,
      stats: {
        totalProfit,
        totalLoss,
        netProfitLoss,
        tradingVolume,
      },
    });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.post("/api/agent/signup", async (req, res) => {
  const { name, team, password } = req.body;

  const agentId = await generateAgentId();
  const hashedPassword = await bcrypt.hash(password, 10);

  const newAgent = new Agent({
    agentId,
    name,
    team,
    password: hashedPassword,
  });

  try {
    await newAgent.save();
    res
      .status(201)
      .json({ message: "Agent signup successful. Awaiting admin approval." });
  } catch (error) {
    res.status(500).json({ message: "Error signing up agent.", error });
  }
});

const clientRequestSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
  },
  clientId: {
    type: String, // Changed to String to store userId
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const ClientRequest = mongoose.model("ClientRequest", clientRequestSchema);

app.post("/api/agent/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const agent = await Agent.findOne({ name });
    if (!agent) {
      return res.status(400).json({ message: "Agent not found." });
    }

    // Check if the agent is approved
    if (!agent.approved) {
      return res.status(403).json({
        message:
          "Your account is not approved yet. Please wait for admin approval.",
      });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const token = jwt.sign({ agentId: agent._id }, jwtSecret, {
      expiresIn: "1h",
    });
    res.json({ token, agentId: agent._id });
  } catch (error) {
    res.status(500).json({ message: "Error logging in.", error });
  }
});

// Admin routes
app.get("/api/admin/agents", async (req, res) => {
  try {
    const agents = await Agent.find({ approved: false });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching agents.", error });
  }
});

app.post("/api/admin/agents/:id/approve", async (req, res) => {
  try {
    await Agent.findByIdAndUpdate(req.params.id, { approved: true });
    res.json({ message: "Agent approved." });
  } catch (error) {
    res.status(500).json({ message: "Error approving agent.", error });
  }
});
app.get("/api/agent-by-user-id/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("agentId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const agent = await Agent.findById(user.agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.json({ agentId: agent.agentId });
  } catch (error) {
    console.error("Error fetching agent by user ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/admin/agents/:id/decline", async (req, res) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ message: "Agent declined." });
  } catch (error) {
    res.status(500).json({ message: "Error declining agent.", error });
  }
});
// Backend route to fetch agents assigned to a specific admin
app.get("/api/agents-for-admin/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;

    // Find the admin by their ID to get their team name
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const agents = await Agent.find({ team: admin.name }); // Find agents for this admin's team
    res.json(agents);
  } catch (error) {
    console.error("Error fetching agents for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Fetch contacts of clients that are assigned to agents under the logged-in admin
app.get("/api/contacts-for-admin/:adminId", async (req, res) => {
  const { adminId } = req.params;

  try {
    // Find the admin by their adminId to get the admin's team
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Fetch agents that belong to the admin's team
    const agents = await Agent.find({ team: admin.name });

    // Extract the agent IDs
    const agentIds = agents.map((agent) => agent._id);

    // Find users who are clients of those agents
    const clients = await User.find({ agentId: { $in: agentIds } });

    // Extract client IDs
    const clientIds = clients.map((client) => client._id);

    // Fetch contacts submitted by those clients
    const contacts = await Contact.find({ userId: { $in: clientIds } });

    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/agents", async (req, res) => {
  try {
    const agents = await Agent.find({});
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching agents.", error });
  }
});
app.delete("/api/agents/:id", async (req, res) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ message: "Agent deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting agent.", error });
  }
});
app.get("/api/agents/:agentId", async (req, res) => {
  const agentId = req.params.agentId;
  const agent = await Agent.findOne({ agentUID: agentId });
  if (agent) {
    res.json({ name: agent.name });
  } else {
    res.status(404).json({ message: "Agent not found" });
  }
});

app.post("/api/assign-client", async (req, res) => {
  const { agentId, clientId, agentUID } = req.body;

  try {
    const agent = await Agent.findById(agentId);
    const client = await User.findById(clientId);

    if (!agent || !client) {
      return res.status(404).json({ message: "Agent or Client not found" });
    }

    agent.clientIds.push(client._id);
    agent.noOfClients += 1;
    client.agentId = agent._id;
    client.agentUID = agentUID; // Add agentUID to client

    await agent.save();
    await client.save();

    res.json({ message: "Client assigned successfully" });
  } catch (error) {
    console.error("Error assigning client:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/assigned-clients/:agentId", async (req, res) => {
  const { agentId } = req.params;

  try {
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const assignedClients = await User.find({ agentId: agent._id });
    res.json(assignedClients);
  } catch (error) {
    console.error("Error fetching assigned clients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/remove-client", async (req, res) => {
  const { agentId, clientId } = req.body;

  try {
    const agent = await Agent.findById(agentId);
    const client = await User.findById(clientId);

    if (!agent || !client) {
      return res.status(404).json({ message: "Agent or Client not found" });
    }

    agent.clientIds = agent.clientIds.filter(
      (id) => id.toString() !== client._id.toString()
    );
    agent.noOfClients -= 1;
    client.agentId = null;
    client.agentUID = null; // Remove agentUID from client

    await agent.save();
    await client.save();

    res.json({ message: "Client removed successfully" });
  } catch (error) {
    console.error("Error removing client:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/request-client", async (req, res) => {
  const { agentId, clientId } = req.body;

  try {
    const agent = await Agent.findById(agentId);
    const client = await User.findOne({ userId: clientId }); // Find by userId

    if (!agent || !client) {
      return res.status(404).json({ message: "Agent or Client not found" });
    }

    // Save the request to a new collection or any preferred way
    const clientRequest = new ClientRequest({
      agentId,
      clientId: client.userId,
    }); // Save userId
    await clientRequest.save();

    res.json({ message: "Client request submitted successfully" });
  } catch (error) {
    console.error("Error requesting client:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/clients-by-admin/:adminId", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Fetch agents that are part of the admin's team
    const agents = await Agent.find({ team: admin.name });

    // Get all the client IDs assigned to the agents
    const agentIds = agents.map((agent) => agent._id);
    const clients = await User.find({ agentId: { $in: agentIds } });

    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Backend route to fetch pending agents under a specific admin's team
app.get("/api/admin/agents-pending/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;

    // Find the admin by their ID to get the team name
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Fetch agents that belong to the admin's team and have not been approved yet
    const agents = await Agent.find({ team: admin.name, approved: false });

    res.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// API route to fetch client requests for agents under the logged-in admin
app.get("/api/client-requests-for-admin/:adminId", async (req, res) => {
  const { adminId } = req.params;

  try {
    // Find the admin by their ID to get their team name
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const adminName = admin.name;

    // Find agents that are part of the admin's team
    const agents = await Agent.find({ team: adminName });

    // Extract the agent IDs
    const agentIds = agents.map((agent) => agent._id);

    // Fetch the client requests for the agents in the admin's team
    const requests = await ClientRequest.find({
      agentId: { $in: agentIds },
    }).populate("agentId clientId");

    res.json(requests);
  } catch (error) {
    console.error("Error fetching client requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/clients-for-admin/:adminId", async (req, res) => {
  const { adminId } = req.params;

  try {
    // Find the admin by their adminId to get the admin name
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const adminName = admin.name;

    // Find agents under the logged-in admin's team (adminName)
    const agents = await Agent.find({ team: adminName });

    // Extract the agent IDs
    const agentIds = agents.map((agent) => agent._id);

    // Find users who are assigned to those agents
    const clients = await User.find({ agentId: { $in: agentIds } });

    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients for admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/client-requests", async (req, res) => {
  try {
    const requests = await ClientRequest.find().populate("agentId clientId");
    res.json(requests);
  } catch (error) {
    console.error("Error fetching client requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to approve a client request
app.post("/api/client-requests/:id/approve", async (req, res) => {
  const { id } = req.params;

  try {
    const request = await ClientRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Fetch agent and client using correct identifiers
    const agent = await Agent.findById(request.agentId);
    const client = await User.findOne({ userId: request.clientId }); // Match `clientId` to `userId`

    if (!agent) {
      console.log("Agent not found with ID:", request.agentId);
      return res.status(404).json({ message: "Agent not found" });
    }

    if (!client) {
      console.log("Client not found with userId:", request.clientId);
      return res.status(404).json({ message: "Client not found" });
    }

    // Proceed with updating agent and client
    agent.clientIds.push(client.userId);
    agent.noOfClients += 1;
    client.agentId = agent._id;

    await agent.save();
    await client.save();
    await ClientRequest.findByIdAndDelete(id);

    res.json({ message: "Client assigned successfully" });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to decline a client request
app.post("/api/client-requests/:id/decline", async (req, res) => {
  const { id } = req.params;

  try {
    await ClientRequest.findByIdAndDelete(id); // Remove the request
    res.json({ message: "Client request declined" });
  } catch (error) {
    console.error("Error declining request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Add this endpoint in your backend code
app.get("/api/user-by-short-id/:shortId", async (req, res) => {
  const { shortId } = req.params;
  try {
    const user = await User.findOne({ userId: shortId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by short ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // MongoDB userId
  uid: { type: String, required: true }, // 7-digit uid
  title: { type: String, required: true },
  description: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

app.post("/api/contact", async (req, res) => {
  const { userId, uid, title, description } = req.body;
  const contact = new Contact({ userId, uid, title, description });

  try {
    await contact.save();
    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error submitting contact form" });
  }
});
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Contact.findByIdAndDelete(id);
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/users/default-trade-results", async (req, res) => {
  try {
    const users = await User.find({}, "userId email defaultTradeResult");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users with default trade results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/send1/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const sendRequests = await Send.find({ userId, status: "complete" }); // Fetch only completed send requests for the user
    if (!sendRequests) {
      return res
        .status(404)
        .json({ message: "No send requests found for this user" });
    }
    res.json(sendRequests);
  } catch (error) {
    console.error("Error fetching send requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/predictions/waiting1", async (req, res) => {
  const { userId } = req.query;
  try {
    const predictions = await Prediction.find({
      userId: userId,
      result: null,
    });
    res.json(predictions);
  } catch (error) {
    console.error("Error fetching waiting predictions:", error);
    res.status(500).json({ error: error.message });
  }
});

const contactUrlSchema = new mongoose.Schema({
  telegram: String,
  whatsapp: String,
  email: String,
});

const ContactUrl = mongoose.model("ContactUrl", contactUrlSchema);

// Route to fetch contact URLs
app.get("/api/contact-urls", async (req, res) => {
  try {
    const contactUrls = await ContactUrl.findOne({});
    res.json(contactUrls || {});
  } catch (error) {
    console.error("Error fetching contact URLs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to save contact URLs
app.post("/api/contact-urls", async (req, res) => {
  try {
    const { telegram, whatsapp, email } = req.body;
    let contactUrls = await ContactUrl.findOne({});

    if (contactUrls) {
      contactUrls.telegram = telegram;
      contactUrls.whatsapp = whatsapp;
      contactUrls.email = email;
    } else {
      contactUrls = new ContactUrl({ telegram, whatsapp, email });
    }

    await contactUrls.save();
    res.json({ message: "Contact URLs updated successfully" });
  } catch (error) {
    console.error("Error saving contact URLs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/agent-uid-by-user-id/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId }).select("agentUID");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.agentUID) {
      return res.status(404).json({ message: "Agent UID not assigned" });
    }

    res.json({ agentUID: user.agentUID });
  } catch (error) {
    console.error("Error fetching agent UID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/wallet3", async (req, res) => {
  const { userId, symbol, amount } = req.body;

  try {
    await Wallet.updateOne(
      { userId },
      { $set: { [`balances.${symbol}`]: amount } },
      { upsert: true }
    );
    res.json({ success: true, message: "Wallet balance updated successfully" });
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/wallet4", async (req, res) => {
  const { userId, symbol, amount } = req.body;

  try {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      // If no wallet exists, create a new wallet with the initial balance for the given symbol
      wallet = new Wallet({
        userId,
        balances: { [symbol.toLowerCase()]: parseFloat(amount) },
      });
    } else {
      const currentBalance = wallet.balances.get(symbol.toLowerCase()) || 0;
      wallet.balances.set(
        symbol.toLowerCase(),
        currentBalance + parseFloat(amount)
      );

      // If symbol is Tether, update USD as well
      if (symbol.toLowerCase() === "tether") {
        const usdBalance = wallet.balances.get("usd") || 0;
        wallet.balances.set("usd", usdBalance + parseFloat(amount));
      }
    }

    await wallet.save();

    res.json({
      success: true,
      message: "Wallet balance updated successfully",
    });
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    res.status(500).json({ error: error.message });
  }
});

const adminSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: false }, // New email field
  password: { type: String, required: true },
  approved: { type: Boolean, default: false },
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

app.post(
  "/api/admin/signup",
  body("name").notEmpty(),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      // Check if an admin with the same email already exists
      let admin = await Admin.findOne({ email });
      if (admin) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Check if an admin with the same name already exists
      admin = await Admin.findOne({ name });
      if (admin) {
        return res.status(400).json({ message: "Admin already exists" });
      }

      // Create new admin
      admin = new Admin({ name, email, password });
      await admin.save();

      res.json({
        message: "Signup successful. Awaiting approval from Master Admin.",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Admin Login Route
app.post("/api/admin/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const admin = await Admin.findOne({ name });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!admin.approved) {
      return res
        .status(403)
        .json({ message: "Admin not approved by Master Admin" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { adminId: admin._id };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

    // Send back the adminId along with the token
    res.json({ success: true, token, adminId: admin._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
app.get("/api/admin/agents/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Fetch pending admin signups
app.get("/api/admins/pending", async (req, res) => {
  try {
    const admins = await Admin.find({ approved: false });
    res.json(admins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Approve or decline admin
app.post("/api/admins/:id/approve", async (req, res) => {
  const { approved } = req.body;
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (approved) {
      admin.approved = true;
      await admin.save();
      res.json({ message: "Admin approved" });
    } else {
      await Admin.findByIdAndDelete(req.params.id);
      res.json({ message: "Admin signup declined" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// Endpoint to fetch all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id email userId");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to fetch a specific user's wallet details
app.get("/api/wallet/:userId", async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    res.json(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to update wallet balance for the selected currency
app.post("/api/wallet3", async (req, res) => {
  const { userId, symbol, amount } = req.body;

  try {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const currentBalance = wallet.balances.get(symbol.toLowerCase()) || 0;
    wallet.balances.set(
      symbol.toLowerCase(),
      currentBalance + parseFloat(amount)
    );
    await wallet.save();

    res.json({ success: true, message: "Wallet balance updated successfully" });
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    res.status(500).json({ error: error.message });
  }
});
// Fetch all admins (add this route if not already present)
app.get("/api/admins", async (req, res) => {
  try {
    const admins = await Admin.find({}, "name _id");
    res.json(admins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete an admin by ID
app.delete("/api/admins/delete/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
const masterAdminSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: false },
  password: { type: String, required: true },
  approved: { type: Boolean, default: false },
});

const MasterAdmin = mongoose.model("MasterAdmin", masterAdminSchema);

masterAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Signup for Master Admin
app.post(
  "/api/master-admin/signup",
  body("name").notEmpty(),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      let masterAdmin = await MasterAdmin.findOne({ email });
      if (masterAdmin) {
        return res.status(400).json({ message: "Email already in use" });
      }

      masterAdmin = await MasterAdmin.findOne({ name });
      if (masterAdmin) {
        return res.status(400).json({ message: "Master Admin already exists" });
      }

      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new Master Admin with hashed password
      masterAdmin = new MasterAdmin({ name, email, password: hashedPassword });

      await masterAdmin.save();

      res.json({
        message: "Signup successful. Awaiting approval from Master Admin.",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Master Admin Login
app.post("/api/master-admin/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const masterAdmin = await MasterAdmin.findOne({ name });
    if (!masterAdmin) {
      console.log("admin not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, masterAdmin.password);
    if (!isMatch) {
      console.log("invalid password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { masterAdminId: masterAdmin._id };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

    res.json({ success: true, token, masterAdminId: masterAdmin._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Fetch all master admins
app.get("/api/master-admins", async (req, res) => {
  try {
    const masterAdmins = await MasterAdmin.find({}, "name _id");
    res.json(masterAdmins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete Master Admin
app.delete("/api/master-admins/delete/:id", async (req, res) => {
  try {
    const masterAdmin = await MasterAdmin.findById(req.params.id);
    if (!masterAdmin) {
      return res.status(404).json({ message: "Master Admin not found" });
    }

    await MasterAdmin.findByIdAndDelete(req.params.id);
    res.json({ message: "Master Admin deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Fetch frozen amount by userId and symbol
app.get("/api/frozen/:userId/", async (req, res) => {
  try {
    const userId = req.params.userId;

    const frozenAmounts = await FrozenAmount.find({ userId });

    if (!frozenAmounts.length) {
      return res
        .status(404)
        .json({ error: "No frozen amounts found for this user" });
    }

    res.json(frozenAmounts);
  } catch (error) {
    console.error("Error fetching frozen amounts:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/send-requests-for-agent/:agentId", async (req, res) => {
  const { agentId } = req.params;

  try {
    const clients = await User.find({ agentId }, "_id"); // Get client IDs for the agent
    const clientIds = clients.map((client) => client._id);

    // Fetch send requests only for those clients
    const sendRequests = await Send.find({
      userId: { $in: clientIds },
      status: "pending",
    }).populate("userId", "userId agentUID");

    res.json(sendRequests);
  } catch (error) {
    console.error("Error fetching send requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/clients-by-agent/:agentId", async (req, res) => {
  const { agentId } = req.params;

  try {
    // Fetch clients assigned to the given agentId
    const clients = await User.find({ agentId }, "_id email userId agentUID");

    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
