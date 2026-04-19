const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Type.ObjectId, ref: "User" },
    items: [
        {
            productId: { type: mongoose.Schema.Type.ObjectId, ref: "Product" },
            quantity: { type: Number, required: true }
        }
    ],
    totalPrice: { type: Number, required: true }
}, {
    timestamps: true
})

module.exports = mongoose.model("Cart", cartSchema);