const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { env, emailRegex, passwordRegex, maxAge } = require("../util/config");
const User = require("../models/user.js");

// JWT oluşturma fonksiyonu
function createToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: env.COOKIE_MAX_AGE }
    );
}

// Kayıt Sayfası
router.get("/register", (req, res) => {
    if (req.cookies.token) return res.redirect("/dashboard");
    res.render("register", { title: "Kayıt Ol", user: null, role: null });
});

router.post("/register", async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!emailRegex.test(email)) {
        return res.cookie("messages",
            { error: "Geçerli bir e-posta adresi girin." },
            { httpOnly: true, maxAge }).redirect("/forgot-password");
    }

    if (!passwordRegex.test(password)) {
        return res.cookie("messages",
            { error: "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir!" },
            { httpOnly: true, maxAge }).redirect(`/register`);
    }

    if (password !== confirmPassword) {
        return res.cookie("messages",
            { error: "Şifreler eşleşmiyor!" },
            { httpOnly: true, maxAge }).redirect(`/register`);
    }

    const user = await User.findOne({ email });
    if (user) {
        res.cookie("messages", { error: "Bu e-posta adresi zaten kullanımda." }, { httpOnly: true, maxAge });
        return res.redirect("/register");
    }

    try {
        const user = new User({ email, password: hashedPassword });
        await user.save();

        res.cookie("role", user.role, { httpOnly: true, signed: true, maxAge });
        res.redirect("/login");
    } catch (err) {
        res.cookie("messages", { error: "Kayıt sırasında hata oluştu." }, { httpOnly: true, maxAge });
        res.status(500).send("Hata oluştu.");
        console.error(err);
    }
});

// Giriş Sayfası
router.get("/login", (req, res) => {
    if (req.cookies.token) return res.redirect("/dashboard");

    const messages = req.cookies.messages || {};
    res.clearCookie("messages");
    res.render("login", { title: "Giriş Yap", user: req.user, role: null, messages });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.cookie("messages", { error: "E-posta adresi bulunamadı." }, { httpOnly: true, maxAge });
        return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.cookie("messages", { error: "Hatalı şifre girdiniz." }, { httpOnly: true, maxAge });
        return res.redirect("/login");
    }

    const token = createToken(user);
    res.cookie("token", token, { httpOnly: true, maxAge });
    res.cookie("role", user.role, { httpOnly: true, signed: true, maxAge });

    res.redirect("/dashboard");
});

// Çıkış Yap
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.clearCookie("role");
    res.redirect("/");
});

module.exports = router;
