const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const Category = require("../models/Category");
const authenticateToken = require("../middlewares/authenticateToken");

// Gider ekleme
router.get("/add", authenticateToken, async (req, res) => {
    try {
        const categories = await Category.find({});
        res.render("add-expense", { title: "Gider Ekle", user: req.user, role: req.user.role, categories });
    } catch (err) {
        console.error("Kategori verisi alınamadı:", err);
        res.render("add-expense", { title: "Gider Ekle", user: req.user, role: req.user.role, categories: [] });
        return res.cookie("messages",
            { error: "Gider kategorileri sunucudan alınamadı!" },
            { httpOnly: true, maxAge }).redirect("/expenses/add");
    }
});

// Geçici olarak kategori ekleme işlemi
/* router.get("/add-categories", async (req, res) => {
    const defaultCategories = ["Kira", "Alışveriş", "Elektrik", "Doğalgaz", "Su", "Abonelik", "Diğer"];
    await Category.insertMany(defaultCategories.map(name => ({ name })));
    res.send("Kategoriler eklendi");
}); */

// Gider ekleme işlemi
router.post("/add", authenticateToken, async (req, res) => {
    const { category, amount, description } = req.body;

    try {
        const expense = new Expense({
            userId: req.user.id,
            category,
            amount,
            description
        });
        await expense.save();
        res.redirect("/dashboard");
    } catch (err) {
        res.status(500).send("Hata oluştu.");
        console.error(err);
    }
});

// Gider silme
router.get("/delete/:id", authenticateToken, async (req, res) => {
    try {
        await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.redirect("/dashboard");
    } catch (err) {
        res.status(500).send("Hata oluştu.");
        console.error(err);
    }
});

// Gider düzenleme form
router.get("/edit/:id", authenticateToken, async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
        const categories = await Category.find();
        if (!expense) return res.redirect("/dashboard");
        res.render("edit-expense", { title: "Gider Düzenleme", user: req.user, role: req.user.role, expense, categories });
    } catch (err) {
        res.status(500).redirect("/dashboard");
        console.error(err);
    }
});

// Gider güncelleme
router.post("/edit/:id", authenticateToken, async (req, res) => {
    const { category, amount, description } = req.body;

    try {
        await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { category, amount, description, date: new Date() }
        );
        res.redirect("/dashboard");
    } catch (err) {
        res.status(500).send("Hata oluştu.");
        console.error(err);
    }
});

module.exports = router;
