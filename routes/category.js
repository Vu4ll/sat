const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');
const { env } = require('../util/config.js');

// Kategori yönetim paneli
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    const categories = await Category.find({});
    res.render('category-panel', {
        title: "Kategori Yönetimi",
        user: req.user,
        role: req.user.role,
        categories,
        color: env.DEFAULT_CHART_COLOR
    });
});

// Yeni kategori ekleme
router.post('/add', authenticateToken, isAdmin, async (req, res) => {
    const { name, color } = req.body;

    if (!name) {
        return res.cookie('messages',
            { error: "Kategori adı boş olamaz!" },
            { httpOnly: true }).redirect("/categories");
    }

    try {
        await Category.create({ name, color });
        res.redirect('/categories');
    } catch (error) {
        console.error(error);
    }
});

// Düzenleme işlemi eklenecek

// Kategori silme
router.post('/delete/:id', authenticateToken, isAdmin, async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories');
});

module.exports = router;
