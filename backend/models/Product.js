const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: [String],
  category: {
    type: String,
    enum: ["Computer"],
    default: "Computer"
  },
  countInStock: Number,
  rating: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);