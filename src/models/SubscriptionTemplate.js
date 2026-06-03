const mongoose = require('mongoose');

const subscriptionTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    boxId: { type: mongoose.Schema.Types.ObjectId, ref: "Box", required: true },
    planType: { type: String, enum: ['1_month', '3_month', '6_month', '12_month'], required: true },
    // totalDeliveries được tính tự động: 1_month=1, 3_month=3, 6_month=6, 12_month=12
    basePrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountPrice: { type: Number, required: true },
    gift: [
        {
            boxId: { type: mongoose.Schema.Types.ObjectId, ref: "Box" },
            quantity: { type: Number, default: 1 }
        }
    ],
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('SubscriptionTemplate', subscriptionTemplateSchema);
