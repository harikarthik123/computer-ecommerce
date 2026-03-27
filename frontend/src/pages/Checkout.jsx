import { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isPaymentDone, setIsPaymentDone] = useState(false);

  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: ""
  });

  const [upiId, setUpiId] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India"
  });

  const buyNowItem = location.state?.buyNowItem;
  const checkoutItems = useMemo(() => {
    if (buyNowItem) return [buyNowItem];
    return cart;
  }, [buyNowItem, cart]);

  const total = checkoutItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const validatePaymentFields = () => {
    if (paymentMethod === "card") {
      if (!cardForm.cardNumber || !cardForm.cardName || !cardForm.expiry || !cardForm.cvv) {
        showToast("Please fill all card details", "error");
        return false;
      }
      if (cardForm.cardNumber.replace(/\s/g, "").length < 12) {
        showToast("Enter a valid card number", "error");
        return false;
      }
      if (cardForm.cvv.length < 3) {
        showToast("Enter a valid CVV", "error");
        return false;
      }
    }

    if (paymentMethod === "upi") {
      if (!upiId || !upiId.includes("@")) {
        showToast("Enter a valid UPI ID", "error");
        return false;
      }
    }

    return true;
  };

  const processPayment = async () => {
    if (!validatePaymentFields()) return;

    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setIsPaymentDone(true);
      showToast("Payment successful");
    }, 1200);
  };

  const placeOrder = async () => {
    if (paymentMethod !== "cod" && !isPaymentDone) {
      showToast("Complete payment before placing order", "error");
      return;
    }

    if (checkoutItems.length === 0) {
      showToast("No items to checkout", "error");
      return;
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      showToast("Please fill full shipping address", "error");
      return;
    }

    const token = localStorage.getItem("token");

    await API.post(
      "/orders",
      {
        orderItems: checkoutItems.map((item) => ({
          name: item.name,
          price: item.price,
          qty: item.qty,
          product: item._id
        })),
        totalPrice: total,
        shippingAddress,
        paymentMethod,
        isPaid: paymentMethod === "cod" ? false : true
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (paymentMethod === "cod") {
      showToast("COD order placed. Payment will be marked by admin after collection.");
    } else {
      showToast("Order placed successfully");
    }

    if (!buyNowItem) {
      clearCart();
    }

    navigate("/my-orders");
  };

  if (!user) return <h2 className="p-6 text-center text-xl font-bold text-slate-700">Please login</h2>;

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">No items in checkout</h2>
          <p className="mt-2 text-slate-500">Add a computer to cart or use Buy Now from product page.</p>
          <button onClick={() => navigate("/")} className="mt-4 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white">
            Browse Computers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl rounded-2xl border border-cyan-100/10 bg-slate-900/65 p-6 shadow-xl backdrop-blur">
      <h2 className="text-3xl font-black text-slate-100">Secure Checkout</h2>
      <p className="mt-1 text-slate-300">Add shipping details and complete payment before placing order.</p>

      {buyNowItem && (
        <p className="mt-3 inline-block rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
          Buy Now Mode
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-cyan-100/10 bg-slate-950/60 p-4">
        <h4 className="text-lg font-bold text-slate-100">Shipping Address</h4>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            placeholder="Full Name"
            value={shippingAddress.fullName}
            onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
          />
          <input
            placeholder="Phone"
            value={shippingAddress.phone}
            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
          />
          <input
            placeholder="Address Line"
            value={shippingAddress.addressLine}
            onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
            className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
          />
          <input
            placeholder="City"
            value={shippingAddress.city}
            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
          />
          <input
            placeholder="State"
            value={shippingAddress.state}
            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
          />
          <input
            placeholder="Postal Code"
            value={shippingAddress.postalCode}
            onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
          />
          <input
            placeholder="Country"
            value={shippingAddress.country}
            onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {checkoutItems.map((item) => (
          <div key={item._id} className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
            <p className="font-semibold text-slate-100">{item.name} x {item.qty}</p>
            <p className="font-bold text-emerald-400">₹{item.price * item.qty}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-6 text-2xl font-black text-cyan-300">Total: ₹{total}</h3>

      <div className="mt-6 rounded-2xl border border-cyan-100/10 bg-slate-950/60 p-4">
        <h4 className="text-lg font-bold text-slate-100">Payment Method</h4>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["card", "Card"],
            ["upi", "UPI"],
            ["cod", "Cash on Delivery"]
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setPaymentMethod(key);
                setIsPaymentDone(false);
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                paymentMethod === key
                  ? "bg-cyan-500 text-slate-900"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {paymentMethod === "card" && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              placeholder="Card Number"
              value={cardForm.cardNumber}
              onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
            />
            <input
              placeholder="Name on Card"
              value={cardForm.cardName}
              onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
            />
            <input
              placeholder="Expiry (MM/YY)"
              value={cardForm.expiry}
              onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
            />
            <input
              placeholder="CVV"
              value={cardForm.cvv}
              onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
            />
          </div>
        )}

        {paymentMethod === "upi" && (
          <div className="mt-4">
            <input
              placeholder="Enter UPI ID (example@upi)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-400"
            />
          </div>
        )}

        {paymentMethod === "cod" && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            COD selected. You can place order without online payment. Admin will mark payment after collection.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={processPayment}
            disabled={paymentLoading || isPaymentDone}
            className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white disabled:opacity-60"
          >
            {paymentLoading ? "Processing..." : isPaymentDone ? "Payment Completed" : "Pay Now"}
          </button>

          {isPaymentDone && (
            <span className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              Payment verified
            </span>
          )}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        onClick={placeOrder}
        className="mt-5 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700"
      >
        Place Order
      </motion.button>
      </div>
    </div>
  );
}

export default Checkout;