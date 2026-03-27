import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 border-b border-cyan-100/10 bg-slate-950/55 px-6 py-3 text-slate-100 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
      <Link to="/" className="text-xl font-black tracking-tight">ShopX</Link>

      <div className="flex gap-4 items-center text-sm font-semibold">
        <Link className="rounded-lg px-3 py-2 hover:bg-white/10" to="/">Home</Link>
        <Link className="rounded-lg px-3 py-2 hover:bg-white/10" to="/cctv-lab">CCTV Lab</Link>

        {/* 👤 Regular User Navigation */}
        {user && user.role === "user" && (
          <>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/10" to="/cart">Cart</Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/10" to="/my-orders">My Orders</Link>
          </>
        )}

        {/* 🔧 Admin Navigation */}
        {user && user.role === "admin" && (
          <>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/10" to="/admin">Dashboard</Link>
          </>
        )}

        {/* User Info & Auth */}
        {user ? (
          <>
            <span className="text-sm">
              {user.name} <span className="text-cyan-300 text-xs">({user.role})</span>
            </span>
            <button
              onClick={logout}
              className="rounded-lg bg-rose-500 px-3 py-2 text-white hover:bg-rose-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/10" to="/login">Login</Link>
            <Link className="rounded-lg bg-cyan-500 px-3 py-2 text-slate-900 hover:bg-cyan-400" to="/register">Register</Link>
          </>
        )}
      </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;