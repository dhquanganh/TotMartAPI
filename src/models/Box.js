const mongoose = require('mongoose')

const boxSchema = new mongoose.Schema({
    name: { type: String, require: true },
    stock: { type: Number, require: true },
    descriptions: { type: String, require: true },

    validFrom: { type: Date, require: true },
    validTo: { type: Date, require: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", require: true },
        quantity: { type: Number, default: 1 },
        name: { type: String }
    }],
    totalItem: { type: Number },
    value: { type: Number, require: true },
    images: [{
        url: { type: String, require: true },
        public_id: { type: String, require: true }
    }],
    isGift: { type: Boolean, default: false }
}, {
    timestamp: true
})

module.exports = mongoose.model('Box', boxSchema);