const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true},
    discount: { type: Number, required: true},
    minOrderValue: { type: Number, default: 0},
    startDate: { type: Date, required: true},
    expiresAt: { type: Date, required: true},
    isActive: { type: Boolean, default: true}
},{
    timestamps: true
})

module.exports = mongoose.model("Coupon", couponSchema);