const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Expense = require("../models/expense.js");
const Category = require("../models/category");
const { env } = require("../util/config.js");

router.get("/expenses", async (req, res) => {
    const token = req.cookies.token;

    try {
        if (!token) return res.status(401).json({ error: "Yetkisiz erişim" });

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(403).json({ error: "Geçersiz token" });
            req.user = user;
        });

        const expenses = await Expense.find({ userId: req.user.id });
        res.status(200).json(expenses);
    } catch (error) {
        console.error("Giderleri çekerken hata oluştu:", error);
        res.status(500).json({ error: "Giderleri çekerken hata oluştu" });
    }
});

router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        console.error("Kategorileri çekerken hata oluştu:", error);
        res.status(500).json({ error: "Kategorileri çekerken hata oluştu" });
    }
});

router.get("/default-category-color", (req, res) => res.status(200).json({ defaultColor: env.DEFAULT_CHART_COLOR }));

module.exports = router;
