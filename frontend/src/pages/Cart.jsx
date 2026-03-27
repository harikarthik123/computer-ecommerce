import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

function Cart() {
  const { cart, removeFromCart, updateQty } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
      <h2 className="mb-4 text-3xl font-black text-slate-100">Your Cart</h2>

      {/* Empty Cart */}
      {cart.length === 0 && (
        <div className="rounded-2xl border border-cyan-100/10 bg-slate-900/55 p-8 text-center text-slate-300 shadow-sm">
          Cart is empty
        </div>
      )}

      {/* Cart Items */}
      <AnimatePresence>
      {cart.map((item) => (
        <motion.div
          key={item._id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -24 }}
          className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-100/10 bg-slate-900/55 p-4 shadow-sm"
        >
          <div className="flex min-w-[260px] items-center gap-3">
            <img
              src={item.images?.[0]}
              alt={item.name}
              className="h-16 w-16 rounded-lg object-cover border border-cyan-100/20"
            />
            <div>
              <h4 className="font-bold text-slate-100">{item.name}</h4>
              <p className="text-sm text-slate-300 line-clamp-1">{item.description || "High-performance computer"}</p>
              <p className="text-emerald-400 font-bold mt-1">₹{item.price}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 p-1">
            <button
              onClick={() => updateQty(item._id, Math.max(1, item.qty - 1))}
              className="h-8 w-8 rounded-lg bg-slate-700 font-bold text-slate-100"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-100">{item.qty}</span>
            <button
              onClick={() => updateQty(item._id, item.qty + 1)}
              className="h-8 w-8 rounded-lg bg-slate-700 font-bold text-slate-100"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item._id)}
            className="rounded-lg bg-rose-900/40 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-900/60"
          >
            Remove
          </button>

          <button
            onClick={() =>
              navigate("/checkout", {
                state: {
                  buyNowItem: {
                    ...item,
                    qty: item.qty || 1
                  }
                }
              })
            }
            className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400"
          >
            Checkout This Item
          </button>
        </motion.div>
      ))}
      </AnimatePresence>

      {/* Total */}
      {cart.length > 0 && (
        <div className="mt-6 rounded-2xl border border-cyan-100/10 bg-slate-900/55 p-5">
          <h3 className="text-lg font-black text-cyan-300">Total: ₹{total}</h3>
          <p className="mt-2 text-sm text-slate-300">
            Use "Checkout This Item" on any product card to continue with that product.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}

export default Cart;