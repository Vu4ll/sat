const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const app = express();
const flash = require('express-flash');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

// Express session
app.use(
    session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

// Veritanı modelleri
const User = require('../models/user.js');
const Expense = require('../models/expense.js');

// Ana Sayfa
app.get('/', (req, res) => {
    res.render('index', { title: "Ana Sayfa", user: req.session.user });
});

// Kayıt Sayfası
app.get('/register', (req, res) => {
    res.render('register', { title: "Kayıt Ol", user: req.session.user });
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOne({ email });
    if (user) {
        req.flash('error', 'Bu e-posta adresi zaten kullanımda.');
        return res.redirect('/register');
    }

    try {
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Hata oluştu.');
    }
});

// Giriş Sayfası
app.get('/login', (req, res) => {
    res.render('login', { title: "Giriş Yap", user: req.session.user, messages: req.flash() });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        req.flash('error', 'E-posta adresi bulunamadı.');
        return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        req.flash('error', 'Hatalı şifre girdiniz.');
        return res.redirect('/login');
    }

    req.session.user = user;
    res.redirect('/dashboard');
});

// Gider ekleme
app.get('/expenses/add', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('add-expense', { title: "Gider Ekle", user: req.session.user });
});

// Gider ekleme işlemi
app.post('/expenses/add', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const { category, amount, description } = req.body;

    try {
        const expense = new Expense({
            userId: req.session.user._id,
            category,
            amount,
            description
        });
        await expense.save();
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Hata oluştu.');
    }
});

// Gider silme
app.get('/expenses/delete/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
        await Expense.findOneAndDelete({ _id: req.params.id, userId: req.session.user._id });
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Hata oluştu.');
    }
});

// Gider düzenleme form
app.get('/expenses/edit/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
        const expense = await Expense.findOne({ _id: req.params.id, userId: req.session.user._id });
        if (!expense) return res.redirect('/dashboard');
        res.render('edit-expense', { title: "Gider Düzenleme", user: req.session.user, expense });
    } catch (err) {
        res.status(500).send('Hata oluştu.');
    }
});

// Gider güncelleme
app.post('/expenses/edit/:id', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const { category, amount, description } = req.body;

    try {
        await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.user._id },
            { category, amount, description }
        );
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Hata oluştu.');
    }
});

// Dashboard
app.get('/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const expenses = await Expense.find({ userId: req.session.user._id }).sort({ date: -1 });
    res.render('dashboard', { title: "Dashboard", user: req.session.user, expenses });
});

// Çıkış Yap
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
