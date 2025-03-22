const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const app = express();
const path = require("path");
const moment = require('moment-timezone');

const ms = require('ms');
const maxAge = ms('7d'); // çerezler için maks süre

const flashMiddleware = require('../middlewares/flashMiddleware');
const authenticateToken = require('../middlewares/authenticateToken');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flashMiddleware);
app.use('/images', express.static(path.join(__dirname, '..', 'views', 'images')));
// moment.locale('tr');

// JWT oluşturma fonksiyonu
function createToken(user) {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Veritanı modelleri
const User = require('../models/user.js');
const Expense = require('../models/expense.js');

// Ana Sayfa
app.get('/', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.render('index', { title: "Ana Sayfa", user: null });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.render('index', { title: "Ana Sayfa", user: null });
        }

        res.render('index', { title: "Ana Sayfa", user });
    });
});

// Kayıt Sayfası
app.get('/register', (req, res) => {
    if (req.cookies.token) return res.redirect('/dashboard');
    res.render('register', { title: "Kayıt Ol", user: null });
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOne({ email });
    if (user) {
        res.cookie('messages', { error: 'Bu e-posta adresi zaten kullanımda.' }, { httpOnly: true, maxAge });
        return res.redirect('/register');
    }

    try {
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.cookie('messages', { error: 'Kayıt sırasında hata oluştu.' }, { httpOnly: true, maxAge });
        res.status(500).send('Hata oluştu.');
        console.error(err);
    }
});

// Giriş Sayfası
app.get('/login', (req, res) => {
    if (req.cookies.token) return res.redirect('/dashboard');

    const messages = req.cookies.messages || {};
    res.clearCookie('messages');
    res.render('login', { title: "Giriş Yap", user: req.user, messages });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.cookie('messages', { error: 'E-posta adresi bulunamadı.' }, { httpOnly: true, maxAge });
        return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.cookie('messages', { error: 'Hatalı şifre girdiniz.' }, { httpOnly: true, maxAge });
        return res.redirect('/login');
    }

    const token = createToken(user);
    res.cookie('token', token, { httpOnly: true, maxAge });
    res.redirect('/dashboard');
});

// Dashboard
app.get('/dashboard', authenticateToken, async (req, res) => {
    const userLocale = req.cookies.locale ? req.cookies.locale.split('-')[0] : 'tr';
    moment.locale(userLocale);
    
    const userTimeZone = req.cookies.timezone || 'Europe/Istanbul';
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });

    const formattedExpenses = expenses.map(expense => ({
        ...expense._doc,
        date: moment(expense.date).tz(userTimeZone).format('LLL') // DD.MM.YYYY HH:mm
    }));
    // console.log(expenses, formattedExpenses);

    res.render('dashboard', { title: "Dashboard", user: req.user, expenses: formattedExpenses });
});

// Gider ekleme
app.get('/expenses/add', authenticateToken, (req, res) => {
    res.render('add-expense', { title: "Gider Ekle", user: req.user });
});

// Gider ekleme işlemi
app.post('/expenses/add', authenticateToken, async (req, res) => {
    const { category, amount, description } = req.body;

    try {
        const expense = new Expense({
            userId: req.user.id,
            category,
            amount,
            description
        });
        await expense.save();
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Hata oluştu.');
        console.error(err);
    }
});

// Gider silme
app.get('/expenses/delete/:id', authenticateToken, async (req, res) => {
    try {
        await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Hata oluştu.');
        console.error(err);
    }
});

// Gider düzenleme form
app.get('/expenses/edit/:id', authenticateToken, async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
        if (!expense) return res.redirect('/dashboard');
        res.render('edit-expense', { title: "Gider Düzenleme", user: req.user, expense });
    } catch (err) {
        res.status(500).send('Hata oluştu.');
        console.error(err);
    }
});

// Gider güncelleme
app.post('/expenses/edit/:id', authenticateToken, async (req, res) => {
    const { category, amount, description } = req.body;

    try {
        await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { category, amount, description }
        );
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Hata oluştu.');
        console.error(err);
    }
});

// Çıkış Yap
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

app.listen(3000, () => console.log('Server running on port 3000'));
