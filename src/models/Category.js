const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true},
    category: { type: String, required: true},
    subcategory: { type: String},
    isActie: { type: Boolean, default: true},
    slug: { type: String, slug: "name"}
},{
    timestamps: true
})

mongoose.plugin(slug);
module.exports = mongoose.model("Category" , categorySchema);