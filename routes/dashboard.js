const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middlewares/authenticateToken");
const Expense = require("../models/expense.js");
const moment = require("moment-timezone");
const { env } = require("../util/config");

// Ana Sayfa
router.get("/", (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.render("index", { title: "Ana Sayfa", user: null, role: null });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.render("index", { title: "Ana Sayfa", user: null, role: null });
        }

        res.render("index", { title: "Ana Sayfa", user, role: req.signedCookies.role });
    });
});

// Dashboard
router.get("/dashboard", authenticateToken, async (req, res) => {
    const userLocale = req.cookies.locale ? req.cookies.locale.split("-")[0] : env.LOCALE;
    moment.locale(userLocale);

    const userTimeZone = req.cookies.timezone ? req.cookies.timezone : env.TIMEZONE;

    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const totalExpenses = await Expense.countDocuments({ userId: req.user.id });
    const totalPages = Math.ceil(totalExpenses / limit);

    const expenses = await Expense.find({ userId: req.user.id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

    const formattedExpenses = expenses.map(expense => ({
        ...expense._doc,
        date: moment(expense.date).tz(userTimeZone).format("LLL")
    }));

    res.render("dashboard", {
        title: "Dashboard",
        user: req.user,
        role: req.user.role,
        expenses: formattedExpenses,
        locale: userLocale,
        page,
        totalPages
    });
});

module.exports = router;
