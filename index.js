const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));

// Express session
app.use(
    session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Kullanıcı Şeması
const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = mongoose.model('User', UserSchema);

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
    if (user) return res.send('Kullanıcı zaten var!');

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
    res.render('login', { title: "Giriş Yap", user: req.session.user });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send('Kullanıcı bulunamadı!');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Hatalı şifre!');

    req.session.user = user;
    res.redirect('/dashboard');
});

// Dashboard
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('dashboard', { title: "Dashboard", user: req.session.user });
});

// Çıkış Yap
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.listen(3000, () => console.log('Server running on port 5000'));
