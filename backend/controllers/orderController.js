const Order = require("../models/Order");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice, isPaid, paymentMethod, shippingAddress } = req.body;

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.addressLine ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.postalCode
    ) {
      return res.status(400).json({ message: "Complete shipping address is required" });
    }

    const normalizedMethod = ["card", "upi", "cod"].includes(paymentMethod)
      ? paymentMethod
      : "card";

    // COD can be marked paid only by admin later.
    const resolvedIsPaid = normalizedMethod === "cod" ? false : Boolean(isPaid);

    const order = new Order({
      user: req.user.id,
      orderItems,
      totalPrice,
      shippingAddress,
      paymentMethod: normalizedMethod,
      isPaid: resolvedIsPaid,
      status: "pending"
    });

    const saved = await order.save();
    res.status(201).json(saved);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate("user", "name email");
  res.json(orders);
};

// Admin: all orders
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "name email");
  res.json(orders);
};

// Admin: Confirm Order (set status to confirmed and add expected delivery date)
exports.confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { expectedDeliveryDate } = req.body;

    if (!expectedDeliveryDate) {
      return res.status(400).json({ message: "Expected delivery date is required" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        status: "confirmed",
        expectedDeliveryDate: new Date(expectedDeliveryDate)
      },
      { new: true }
    ).populate("user", "name email");

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Mark order as paid (mainly for COD)
exports.markOrderPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isPaid = true;
    const updated = await order.save();
    const populated = await updated.populate("user", "name email");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};