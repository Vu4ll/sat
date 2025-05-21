const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema({
    to: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ["success", "failure"], required: true },
    error: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EmailLog", emailLogSchema);