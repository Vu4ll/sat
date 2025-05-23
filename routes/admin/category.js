const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Category = require("../../models/category.js");
const authenticateToken = require("../../middlewares/authenticateToken.js");
const isAdmin = require("../../middlewares/isAdmin.js");
const { env } = require("../../util/config.js");

// Kategori yönetim paneli
router.get("/", authenticateToken, isAdmin, async (req, res) => {
    const categories = await Category.find({});
    res.render("admin/categories/category-panel", {
        title: "Kategori Yönetimi",
        user: req.user,
        role: req.user.role,
        categories,
        color: env.DEFAULT_CHART_COLOR
    });
});

// Yeni kategori ekleme
router.post("/add", authenticateToken, isAdmin, async (req, res) => {
    const { name, color } = req.body;

    if (!name) {
        return res.cookie("messages",
            { error: "Kategori adı boş olamaz!" },
            { httpOnly: true }).redirect("/admin/categories");
    }

    try {
        await Category.create({ name, color });
        res.redirect("/admin/categories");
    } catch (error) {
        console.error(error);
    }
});

// Kategori düzenleme formu
router.get("/edit/:id", authenticateToken, isAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.cookie("messages",
            { error: "Geçersiz kategori ID!" },
            { httpOnly: true }).redirect(`/admin/categories`);
    }

    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.cookie("messages",
                { error: "Kategori bulunamadı!" },
                { httpOnly: true }).redirect("/admin/categories");
        }

        res.render("admin/categories/edit-category", {
            title: "Kategori Düzenle",
            user: req.user,
            role: req.user.role,
            category
        });
    } catch (error) {
        console.error("Kategori düzenleme formu hatası:", error);
        res.redirect("/admin/categories");
    }
});

// Kategori düzenleme işlemi
router.post("/edit/:id", authenticateToken, isAdmin, async (req, res) => {
    const { name, color } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.cookie("messages",
            { error: "Geçersiz kategori ID!" },
            { httpOnly: true }).redirect(`/admin/categories`);
    }

    if (!name) {
        return res.cookie("messages",
            { error: "Kategori adı boş olamaz!" },
            { httpOnly: true }).redirect(`/admin/categories/edit/${req.params.id}`);
    }

    try {
        await Category.findByIdAndUpdate(req.params.id, { name, color });
        res.redirect("/admin/categories");
    } catch (error) {
        console.error("Kategori düzenleme hatası:", error);
        res.redirect("/admin/categories");
    }
});

// Kategori silme
router.post("/delete/:id", authenticateToken, isAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.cookie("messages",
            { error: "Geçersiz kategori ID!" },
            { httpOnly: true }).redirect(`/admin/categories`);
    }

    await Category.findByIdAndDelete(req.params.id);
    res.redirect("/admin/categories");
});

module.exports = router;
