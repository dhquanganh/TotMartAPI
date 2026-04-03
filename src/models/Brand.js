const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    name: { type: String, required: true },
    slug: { type: String, slug: "name", unique: true },
    logo: { type: String },
    description: { type: String },
    cityAddress: { type: String},
}, {
    timestamps: true
})

module.exports = mongoose.model("Brand", brandSchema);