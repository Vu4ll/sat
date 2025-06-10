const mongoose = require("mongoose");

const authLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ipAddress: { type: String },
    action: { type: String, enum: ["register", "login", "logout", "password_forget", "password_reset"], required: true },
    status: { type: String, enum: ["success", "fail"], default: "success" },
    details: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("authLog", authLogSchema);