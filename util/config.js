const dotenv = require("dotenv");
dotenv.config();
const ms = require("ms");

const env = {
    PORT: process.env.PORT || 3000,
    APP_URL: `${process.env.APP_URL}` || `http://localhost`,
    COOKIE_MAX_AGE: process.env.COOKIE_MAX_AGE || "7d",
    LOCALE: process.env.LOCALE || "tr",
    TIMEZONE: process.env.TIMEZONE || "Europe/Istanbul",
    RESET_PASSWORD_EXPIRES: process.env.RESET_PASSWORD_EXPIRES || "1h"
};

const maxAge = ms(env.COOKIE_MAX_AGE);
const APP_URL_W_PORT = env.PORT == 80 || env.PORT == 443 ? env.APP_URL : `${env.APP_URL}:${env.PORT}`
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

module.exports = { env, maxAge, APP_URL_W_PORT, emailRegex, passwordRegex };