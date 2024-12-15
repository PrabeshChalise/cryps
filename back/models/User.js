const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minLength: 5,
    required: true,
  },
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  walletAddress: {
    type: String,
    unique: true,
    required: true,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
  },
  agentUID: { type: String, default: null },
  defaultTradeResult: {
    type: String,
    enum: ["win", "loss", null],
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
