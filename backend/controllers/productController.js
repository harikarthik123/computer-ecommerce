const Product = require("../models/Product");
const User = require("../models/User");

const recalculateRating = (product) => {
  if (!product.reviews || product.reviews.length === 0) {
    product.rating = 0;
    return;
  }

  const total = product.reviews.reduce((sum, review) => sum + Number(review.stars || 0), 0);
  product.rating = Number((total / product.reviews.length).toFixed(1));
};

// Get all products
exports.getProducts = async (req, res) => {
  const products = await Product.find({ category: "Computer" });
  res.json(products);
};

// Get single product
exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.reviews = [...(product.reviews || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(product);
};

// Create product (Admin)
exports.createProduct = async (req, res) => {
  const product = new Product({
    ...req.body,
    category: "Computer"
  });
  const saved = await product.save();
  res.status(201).json(saved);
};
// Update product
exports.updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    Object.assign(product, req.body);
    product.category = "Computer";
    const updated = await product.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

// Add review
exports.addReview = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can add reviews" });
    }

    const { comment, stars } = req.body;

    if (!comment || !stars) {
      return res.status(400).json({ message: "Comment and stars are required" });
    }

    if (Number(stars) < 1 || Number(stars) > 5) {
      return res.status(400).json({ message: "Stars should be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existing = product.reviews.find((r) => String(r.user) === String(req.user.id));
    if (existing) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const currentUser = await User.findById(req.user.id);
    const userName = currentUser?.name || "User";

    product.reviews.push({
      user: req.user.id,
      userName,
      comment,
      stars: Number(stars),
      likes: []
    });

    recalculateRating(product);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle like on review
exports.toggleReviewLike = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const likeIndex = review.likes.findIndex((u) => String(u) === String(req.user.id));
    if (likeIndex >= 0) {
      review.likes.splice(likeIndex, 1);
    } else {
      review.likes.push(req.user.id);
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};