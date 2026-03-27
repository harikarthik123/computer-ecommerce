const express = require("express");
const router = express.Router();

// ✅ Import ONLY ONCE at top
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  toggleReviewLike
} = require("../controllers/productController");

// Routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/reviews", protect, addReview);
router.put("/:id/reviews/:reviewId/like", protect, toggleReviewLike);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;