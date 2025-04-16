const express = require('express');
const router = express.Router();

router.use("/", require("../routes/dashboard"));
router.use("/", require("../routes/auth"));
router.use("/", require("../routes/password"));
router.use("/api", require("../routes/api"));
router.use("/categories", require("../routes/category"));
router.use("/expenses", require("../routes/expense"));

module.exports = router;
