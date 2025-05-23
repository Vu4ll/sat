const express = require('express');
const router = express.Router();

router.use("/", require("./dashboard"));
router.use("/", require("./auth"));
router.use("/", require("./password"));
router.use("/api", require("./api"));
router.use("/admin/categories", require("./admin/category"));
router.use("/expenses", require("./expense"));
router.use("/export", require("./export"));

module.exports = router;
