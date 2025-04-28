const mongoose = require("mongoose");
const { env } = require("../util/config.js");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    color: { type: String, default: env.DEFAULT_CHART_COLOR }
});

categorySchema.statics.initializeDefaults = async function () {
    const defaultCategories = [
        { name: "Kira", color: "#FF6384" },
        { name: "Alışveriş", color: "#36A2EB" },
        { name: "Elektrik", color: "#FFCE56" },
        { name: "Doğalgaz", color: "#4BC0C0" },
        { name: "Su", color: "#5449EE" },
        { name: "Abonelik", color: "#FF9F40" },
        { name: "Diğer", color: "#A133FF" }
    ];

    for (const { name, color } of defaultCategories) {
        const exists = await this.findOne({ name });
        if (!exists) {
            await this.create({ name, color });
            console.log(`Kategori eklendi: ${name}`);
        }
    }
};

module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema);
