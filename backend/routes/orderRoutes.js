const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  confirmOrder,
  markOrderPaid
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/confirm", protect, adminOnly, confirmOrder);
router.put("/:id/mark-paid", protect, adminOnly, markOrderPaid);

module.exports = router;