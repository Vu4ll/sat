const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

categorySchema.statics.initializeDefaults = async function () {
    const defaultCategories = [
        "Kira",
        "Alışveriş",
        "Elektrik",
        "Doğalgaz",
        "Su",
        "Abonelik",
        "Diğer"
    ];

    for (const name of defaultCategories) {
        const exists = await this.findOne({ name });
        if (!exists) {
            await this.create({ name });
            console.log(`Kategori eklendi: ${name}`);
        }
    }
};

module.exports = mongoose.model("Category", categorySchema);
