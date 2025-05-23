const express = require("express");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const { env, APP_URL_W_PORT } = require("./config");
const flashMiddleware = require("../middlewares/flashMiddleware");
const pkg = require('../package.json');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(flashMiddleware);
app.use(mongoSanitize());
app.use("/images", express.static(path.join(__dirname, "..", "views", "images")));
app.use("/js", express.static(path.join(__dirname, "..", "views", "js")));
app.use("/", require("../routes"));
app.locals.version = pkg.version;

app.listen(env.PORT, () => console.log(`Server running on ${APP_URL_W_PORT}`));
