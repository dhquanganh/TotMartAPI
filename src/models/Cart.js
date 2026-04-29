const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            subcricePlanId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscribePlan" },
            boxId: { type: mongoose.Schema.Types.ObjectId, ref: "Box" },
            quantity: { type: Number }
        }
    ],
    totalPrice: { type: Number, required: true },
    isSubcribeCart: { type: Boolean, default: false }
}, {
    timestamps: true
})

module.exports = mongoose.model("Cart", cartSchema);