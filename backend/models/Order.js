const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  orderItems: [
    {
      name: String,
      price: Number,
      qty: Number,
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    }
  ],
  totalPrice: Number,
  shippingAddress: {
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    addressLine: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "India" }
  },
  paymentMethod: {
    type: String,
    enum: ["card", "upi", "cod"],
    default: "card"
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  expectedDeliveryDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);