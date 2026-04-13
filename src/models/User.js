const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: {
      url: { type: String },
      public_id: { type: String }
    },
    addreses: [
      {
        country: { type: String },
        city: { type: String },
        district: { type: String },
        address: { type: String },
        phone: { type: String }
      }
    ],
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
      }
    ],
    isActive: { type: Boolean, default: true },
    refreshToken: [{ type: String }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    subscribePlan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscribePlan" }
  }, {
  timestamps: true
}
)

module.exports = mongoose.model('User', userSchema);