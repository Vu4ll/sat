const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Expense = require("../models/expense.js");

// Giderleri API ile çekme
router.get("/expenses", async (req, res) => {
    const token = req.cookies.token;

    try {
        if (!token) return res.status(401).json({ error: "Yetkisiz erişim" });

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(403).json({ error: "Geçersiz token" });
            req.user = user;
        });

        const expenses = await Expense.find({ userId: req.user.id });
        res.json(expenses);
    } catch (error) {
        console.error("Giderleri çekerken hata oluştu:", error);
        res.status(500).json({ error: "Giderleri çekerken hata oluştu" });
    }
});

module.exports = router;
