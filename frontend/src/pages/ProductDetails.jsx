import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import API from "../services/api";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [index, setIndex] = useState(0);
  const [reviewForm, setReviewForm] = useState({ comment: "", stars: 5 });
  const [reviewLoading, setReviewLoading] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        buyNowItem: {
          _id: product._id,
          name: product.name,
          price: product.price,
          qty: 1
        }
      }
    });
    showToast("Proceed to secure checkout");
  };

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const refreshProduct = async () => {
    const { data } = await API.get(`/products/${id}`);
    setProduct(data);
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast("Please login to add review", "error");
      return;
    }

    if (user.role !== "user") {
      showToast("Only users can add reviews", "error");
      return;
    }

    if (!reviewForm.comment.trim()) {
      showToast("Please write your review", "error");
      return;
    }

    try {
      setReviewLoading(true);
      const token = localStorage.getItem("token");
      await API.post(
        `/products/${id}/reviews`,
        {
          comment: reviewForm.comment.trim(),
          stars: Number(reviewForm.stars)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReviewForm({ comment: "", stars: 5 });
      showToast("Review added");
      await refreshProduct();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add review", "error");
    } finally {
      setReviewLoading(false);
    }
  };

  const toggleLike = async (reviewId) => {
    if (!user) {
      showToast("Please login to like reviews", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/products/${id}/reviews/${reviewId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await refreshProduct();
    } catch (err) {
      showToast("Failed to update like", "error");
    }
  };

  if (!product) {
    return (
      <div className="p-6">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-24 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">

      {/* Images */}
      <div>
        <div className="group h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <AnimatePresence mode="wait">
            <motion.img
              key={product.images?.[index]}
              src={product.images?.[index]}
              alt={product.name}
              initial={{ opacity: 0.3, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.2, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </AnimatePresence>
        </div>

        <div className="mt-3 flex gap-3">
          {product.images?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`product-${i}`}
              onClick={() => setIndex(i)}
              className={`h-16 w-16 cursor-pointer rounded-lg object-cover transition ${
                index === i ? "border-2 border-cyan-600" : "border border-slate-300 hover:border-slate-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-black text-slate-900">{product.name}</h2>

        <p className="mt-2 text-2xl font-black text-emerald-600">₹{product.price}</p>

        <p className="mt-4 text-slate-600">{product.description}</p>

        {/* ✅ Only show Add to Cart for regular users, not admins */}
        {user?.role !== "admin" && (
          <div className="mt-6 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => addToCart(product)}
              className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-700"
            >
              Add to Cart
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={handleBuyNow}
              className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600"
            >
              Buy Now
            </motion.button>
          </div>
        )}

        {/* 🔒 Admin cannot purchase */}
        {user?.role === "admin" && (
          <p className="mt-6 text-red-500 font-semibold">⚠️ Admins cannot make purchases</p>
        )}
      </div>

      </div>

      <section className="mx-auto mt-10 max-w-7xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-black text-slate-900">User Reviews</h3>
          <p className="text-sm font-semibold text-slate-500">
            {product.reviews?.length || 0} reviews • Rating {product.rating || 0}/5
          </p>
        </div>

        <form onSubmit={submitReview} className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-bold text-black">Write a review</h4>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-black">Stars</label>
            <select
              value={reviewForm.stars}
              onChange={(e) => setReviewForm({ ...reviewForm, stars: Number(e.target.value) })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-black"
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very Good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
          </div>

          <textarea
            rows="3"
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            placeholder="Share your experience with this computer"
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={reviewLoading}
            className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {reviewLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        <div className="mt-5 space-y-3">
          {(product.reviews || []).length === 0 && (
            <p className="text-sm text-black">No reviews yet. Be the first to review this product.</p>
          )}

          {(product.reviews || []).map((review) => {
            const isLiked = !!review.likes?.some((u) => String(u) === String(user?.id));

            return (
              <div key={review._id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-slate-900">{review.userName}</p>
                  <p className="text-sm font-semibold text-amber-600">{"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}</p>
                </div>

                <p className="mt-2 text-sm text-black">{review.comment}</p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(review._id)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                      isLiked ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    👍 {isLiked ? "Liked" : "Like"}
                  </button>
                  <span className="text-xs text-black">{review.likes?.length || 0} likes</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

export default ProductDetails;