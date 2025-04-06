const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');

// Kategori yönetim paneli
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    const categories = await Category.find({});
    res.render('category-panel', { title: "Kategori Yönetimi", user: req.user, role: req.user.role, categories });
});

// Yeni kategori ekleme
router.post('/add', authenticateToken, isAdmin, async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.cookie('messages',
            { error: "Kategori adı boş olamaz!" },
            { httpOnly: true }).redirect("/categories");
    }

    try {
        await Category.create({ name });
        res.redirect('/categories');
    } catch (error) {
        console.error(error);
    }
});

// Kategori silme
router.post('/delete/:id', authenticateToken, isAdmin, async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories');
});

module.exports = router;
