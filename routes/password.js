const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const sendPasswordResetEmail = require("../util/mail");
const ms = require("ms");
const { env, emailRegex, passwordRegex, maxAge, APP_URL_W_PORT } = require("../util/config");

// Şifre sıfırlama formu
router.get("/forgot-password", (req, res) => {
    if (req.cookies.token) return res.redirect("/dashboard");

    res.render("forgot-password", { title: "Şifre Sıfırla", user: req.user, role: null });
});

router.post("/forgot-password", async (req, res) => {
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
        // BURAYI UNUTMA //
        await sendPasswordResetEmail(email, resetLink);
        console.log(email, resetLink);

        res.cookie("resetSuccess", true, { httpOnly: true, maxAge });
        return res.cookie("messages",
            { success: "Şifre sıfırlama e-postası gönderildi!" },
            { httpOnly: true, maxAge }).redirect("/forgot-password-success");
    } catch (error) {
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

    res.render("forgot-password-success", {
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

    res.render("reset-password", {
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

        if (await bcrypt.compare(newPassword, user.password)) {
            return res.cookie("messages",
                { error: "Yeni şifre, eski şifre ile aynı olamaz!" },
                { httpOnly: true, maxAge }).redirect(`/reset-password?token=${token}`);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.cookie("messages",
            { success: "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz." },
            { httpOnly: true, maxAge }).redirect("/login");
    } catch (error) {
        console.error("Şifre Sıfırlama Hatası:", error);
        return res.cookie("messages",
            { error: "Şifre sıfırlama işlemi başarısız oldu!" },
            { httpOnly: true, maxAge }).redirect(`/reset-password?token=${token}`);
    }
});

module.exports = router;