const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { env, emailRegex, passwordRegex, maxAge } = require("../util/config");
const User = require("../models/user.js");
const AuthLog = require("../models/authLog.js");

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
    res.render("auth/register", { title: "Kayıt Ol", user: null, role: null });
});

router.post("/register", async (req, res) => {
    const { email, password, confirmPassword } = req.body;

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
        const hashedPassword = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });
        const user = new User({ email, password: hashedPassword });
        await user.save();

        await AuthLog.create({
            userId: user._id,
            ipAddress: req.ip,
            action: "register",
            status: "success",
            details: "Kullanıcı başarıyla kaydedildi.",
            createdAt: new Date()
        });

        res.cookie("role", user.role, { httpOnly: true, signed: true, maxAge });
        res.redirect("/login");
    } catch (err) {
        await AuthLog.create({
            userId: null,
            ipAddress: req.ip,
            action: "register",
            status: "fail",
            details: err.message,
            createdAt: new Date()
        });

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
    res.render("auth/login", { title: "Giriş Yap", user: req.user, role: null, messages });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.cookie("messages", { error: "E-posta adresi bulunamadı." }, { httpOnly: true, maxAge });
        return res.redirect("/login");
    }

    try {
        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            res.cookie("messages", { error: "Hatalı şifre girdiniz." }, { httpOnly: true, maxAge });
            return res.redirect("/login");
        }

        const token = createToken(user);
        res.cookie("token", token, { httpOnly: true, maxAge });
        res.cookie("role", user.role, { httpOnly: true, signed: true, maxAge });

        res.redirect("/dashboard");

        await AuthLog.create({
            userId: user._id,
            ipAddress: req.ip,
            action: "login",
            status: "success",
            details: "Kullanıcı başarıyla giriş yaptı.",
            createdAt: new Date()
        });
    } catch (err) {
        console.error("Şifre doğrulama sırasında hata oluştu:", err);
        res.cookie("messages", { error: "Bir hata oluştu. Lütfen tekrar deneyin." }, { httpOnly: true, maxAge });
        res.status(500).redirect("/login");
    }
});

// Çıkış Yap
router.get("/logout", async (req, res) => {
    await AuthLog.create({
        userId: req.user ? req.user.id : null,
        ipAddress: req.ip,
        action: "logout",
        status: "success",
        details: "Kullanıcı başarıyla çıkış yaptı.",
        createdAt: new Date()
    });
    
    res.clearCookie("token");
    res.clearCookie("role");
    res.redirect("/");
});

module.exports = router;
