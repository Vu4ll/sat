const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const crypto = require("crypto");
const argon2 = require("argon2");
const User = require("../models/user.js");
const sendPasswordResetEmail = require("../util/mail");
const ms = require("ms");
const { env, emailRegex, passwordRegex, maxAge, APP_URL_W_PORT } = require("../util/config");
const AuthLog = require("../models/authLog.js");

const forgotPasswordLimiter = rateLimit({
    windowMs: ms(env.PASSWORD_RESET_RATE_LIMIT),
    max: env.PASSWORD_RESET_MAX_ATTEMPT,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.cookie("messages",
            { error: "Çok fazla şifre sıfırlama isteği gönderdiniz. Lütfen daha sonra tekrar deneyin." },
            { httpOnly: true, maxAge }
        );
        return res.redirect("/forgot-password");
    }
});

// Şifre sıfırlama formu
router.get("/forgot-password", (req, res) => {
    if (req.cookies.token) return res.redirect("/dashboard");

    res.render("password/forgot-password", { title: "Şifre Sıfırla", user: req.user, role: null });
});

router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
    const { email } = req.body;

    try {
        if (!emailRegex.test(email)) {
            return res.cookie("messages",
                { error: "Geçerli bir e-posta adresi girin." },
                { httpOnly: true, maxAge }).redirect("/forgot-password");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.cookie("messages",
                { error: "Bu e-posta kayıtlı değil!" },
                { httpOnly: true, maxAge }).redirect("/forgot-password");
        }

        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + ms(env.RESET_PASSWORD_EXPIRES);
        await user.save();

        const resetLink = `${APP_URL_W_PORT}/reset-password?token=${token}`;

        await sendPasswordResetEmail(email, resetLink);
        console.log(email, resetLink);

        await AuthLog.create({
            userId: null,
            ipAddress: req.ip,
            action: "password_forget",
            status: "success",
            details: `Şifre sıfırlama e-postası gönderildi: ${email}`,
            createdAt: new Date()
        });

        res.cookie("resetSuccess", true, { httpOnly: true, maxAge });
        return res.cookie("messages",
            { success: "Şifre sıfırlama e-postası gönderildi!" },
            { httpOnly: true, maxAge }).redirect("/forgot-password-success");
    } catch (error) {
        await AuthLog.create({
            userId: null,
            ipAddress: req.ip,
            action: "password_forget",
            status: "fail",
            details: `Şifre sıfırlama e-postası gönderilemedi: ${email} \n${error.message}`,
            createdAt: new Date()
        });

        console.error("Şifre Sıfırlama Hatası:", error);
        return res.cookie("messages",
            { error: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." },
            { httpOnly: true, maxAge }).redirect("/forgot-password");
    }
});

// Şifre sıfırlama başarı sayfası
router.get("/forgot-password-success", (req, res) => {
    if (req.cookies.token) return res.redirect("/dashboard");
    if (!req.cookies.resetSuccess) return res.redirect("/forgot-password");

    const messages = req.cookies.messages || {};
    res.clearCookie("messages");
    res.clearCookie("resetSuccess");

    res.render("password/forgot-password-success", {
        title: "Şifre Sıfırlama Başarılı",
        user: req.user,
        role: null,
        messages
    });
});

router.get("/reset-password", async (req, res) => {
    const { token } = req.query;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.cookie("messages",
            { error: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş." },
            { httpOnly: true, maxAge }).redirect("/forgot-password");
    }

    res.render("password/reset-password", {
        title: "Yeni Şifre Belirle",
        user: req.user,
        role: null,
        token
    });
});

router.post("/reset-password", async (req, res) => {
    const { token, newPassword, confirmNewPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (newPassword != confirmNewPassword) {
            return res.cookie("messages",
                { error: "Şifreler eşleşmiyor!" },
                { httpOnly: true, maxAge }).redirect(`/reset-password?token=${token}`);
        }

        if (!user) {
            return res.cookie("messages",
                { error: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş." },
                { httpOnly: true, maxAge }).redirect("/forgot-password");
        }

        if (!passwordRegex.test(newPassword)) {
            return res.cookie("messages",
                { error: "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir!" },
                { httpOnly: true, maxAge }).redirect(`/reset-password?token=${token}`);
        }

        const isSamePassword = await argon2.verify(user.password, newPassword);
        if (isSamePassword) {
            return res.cookie("messages",
                { error: "Yeni şifre, eski şifre ile aynı olamaz!" },
                { httpOnly: true, maxAge }).redirect(`/reset-password?token=${token}`);
        }

        const hashedPassword = await argon2.hash(newPassword, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        await AuthLog.create({
            userId: user._id,
            ipAddress: req.ip,
            action: "password_reset",
            status: "success",
            details: "Kullanıcı şifresi başarıyla sıfırlandı.",
            createdAt: new Date()
        });

        return res.cookie("messages",
            { success: "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz." },
            { httpOnly: true, maxAge }).redirect("/login");
    } catch (error) {
        await AuthLog.create({
            userId: null,
            ipAddress: req.ip,
            action: "password_reset",
            status: "fail",
            details: `Şifre sıfırlama başarısız: ${error.message}`,
            createdAt: new Date()
        });

        console.error("Şifre Sıfırlama Hatası:", error);
        return res.cookie("messages",
            { error: "Şifre sıfırlama işlemi başarısız oldu!" },
            { httpOnly: true, maxAge }).redirect(`/reset-password?token=${token}`);
    }
});

module.exports = router;