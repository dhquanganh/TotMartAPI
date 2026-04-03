const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", requied: true},
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
            quantity: { type: Number, default: 1},
            brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand"},
            totalPrice: { type: Number, required: true},
        }
    ],
    orderId: { type: String, required: true, unique: true},
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending'},
    totalAmount: { type: Number, required: true},
    shippingFee: { type: Number, default: 0},
    discountAmount: { type: Number, default: 0},
    shippingAddress: {
        city: { type: String},
        fullName: { type: String},
        phone: { type: String},
        address: { type: String},
        country: { type: String},
        postalCode: { type: String}
    },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod'},
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending'},
    note: { type: String},
    couponCode: { type: String}
},{
    timestamps: true
})

module.exports = mongoose.model("Order", orderSchema);