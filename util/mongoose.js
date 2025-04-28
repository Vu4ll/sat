const mongoose = require("mongoose");
const Category = require("../models/category");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    await Category.initializeDefaults();
});

mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB!");
});

mongoose.connection.on("error", () => {
    console.error("Failed to connect MongoDB!");
});