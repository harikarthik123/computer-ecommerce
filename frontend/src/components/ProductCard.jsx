import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

function ProductCard({ product, addToCart }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <motion.div
      onClick={() => navigate(`/product/${product._id}`)}
      whileHover={{ y: -6 }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-cyan-100/10 bg-slate-900/55 p-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl"
    >
      <div className="relative h-44 overflow-hidden rounded-xl bg-slate-800">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
        />

        {user?.role !== "admin" && (
          <div className="absolute inset-x-2 bottom-2 flex translate-y-10 gap-2 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Add to Cart
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product._id}`);
              }}
              className="flex-1 rounded-lg bg-cyan-400/90 px-3 py-2 text-xs font-semibold text-slate-900"
            >
              View Details
            </button>
          </div>
        )}
      </div>

      <h3 className="mt-3 text-base font-bold text-slate-100">{product.name}</h3>

      <p className="mt-1 line-clamp-2 text-sm text-slate-300">{product.description}</p>

      <p className="mt-2 text-xl font-black text-emerald-400">₹{product.price}</p>

      {user?.role === "admin" && (
        <p className="mt-3 text-xs font-semibold text-cyan-300">Manage computer details in Admin Dashboard</p>
      )}
    </motion.div>
  );
}

export default ProductCard;
