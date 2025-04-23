const express = require('express');
const router = express.Router();

router.use("/", require("./dashboard"));
router.use("/", require("./auth"));
router.use("/", require("./password"));
router.use("/api", require("./api"));
router.use("/categories", require("./category"));
router.use("/expenses", require("./expense"));

module.exports = router;
