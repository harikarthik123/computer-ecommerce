import { createContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { showToast } = useToast();

  // Load from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart"));
    if (stored) setCart(stored);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add to cart
  const addToCart = (product) => {
    const exists = cart.find((item) => item._id === product._id);

    if (exists) {
      setCart(cart.map((item) =>
        item._id === product._id
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
      showToast("Cart updated");
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
      showToast("Added to cart");
    }
  };

  // Remove
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
    showToast("Item removed", "error");
  };

  // Update qty
  const updateQty = (id, qty) => {
    setCart(cart.map((item) =>
      item._id === id ? { ...item, qty } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};