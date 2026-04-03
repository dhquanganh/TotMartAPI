const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true},
        price: { type: Number, required: true},
        description: { type: String},
        brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand"},
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category"},
        instock: { type: Boolean, default: true},
        images: [
            {
                url: { type: String, required: true},
                public_id: { type: String, required: true }
            }
        ],
        salePercent: { type: Number, default: 0},
        details: {type: String},
        rate: { type: Number, default: 0},
        variants: [
            {
                name: { type: String},
                options: [ {type: String }]
            }
        ],
        slug: { type: String, slug: "name", unique: true},
        views: { type: Number, default: 0},
        selledNumber: { type: Number, default: 0},
    },{
        timestamps: true
    }
)

mongoose.plugin(slug);
module.exports = mongoose.model('Product', productSchema);