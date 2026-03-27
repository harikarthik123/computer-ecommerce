import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";
import CCTVLab from "./pages/CCTVLab";

// 🔒 Protected Route Component for Admin
function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

// 🔒 Protected Route Component for Users
function UserRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user || user.role === "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin");
  const PageWrap = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.div>
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrap><Home /></PageWrap>} />
        <Route path="/login" element={<PageWrap><Login /></PageWrap>} />
        <Route path="/register" element={<PageWrap><Register /></PageWrap>} />
        <Route path="/product/:id" element={<PageWrap><ProductDetails /></PageWrap>} />
        <Route path="/cctv-lab" element={<PageWrap><CCTVLab /></PageWrap>} />

        {/* 👤 User Only Routes */}
        <Route path="/cart" element={<UserRoute><PageWrap><Cart /></PageWrap></UserRoute>} />
        <Route path="/checkout" element={<UserRoute><PageWrap><Checkout /></PageWrap></UserRoute>} />
        <Route path="/my-orders" element={<UserRoute><PageWrap><MyOrders /></PageWrap></UserRoute>} />

        {/* 🔧 Admin Only Routes */}
        <Route path="/admin" element={<AdminRoute><PageWrap><AdminDashboard /></PageWrap></AdminRoute>} />
      </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;