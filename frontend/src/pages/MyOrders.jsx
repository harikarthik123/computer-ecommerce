import { useEffect, useState } from "react";
import API from "../services/api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    API.get("/orders/my", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "⏳",
      confirmed: "✅",
      shipped: "🚚",
      delivered: "📦",
      cancelled: "❌"
    };
    return icons[status] || "📋";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/60 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">📋 My Orders</h1>
          <p className="text-slate-300">Track your orders, payment status and shipment address</p>
        </div>

        {/* Empty Orders */}
        {orders.length === 0 ? (
          <div className="bg-slate-900/70 border border-cyan-100/10 rounded-lg shadow-md p-12 text-center">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-2xl font-bold text-slate-100 mb-2">No Orders Yet</p>
            <p className="text-slate-300">Start shopping to create your first order!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-slate-900/70 border border-cyan-100/10 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90">Order ID</p>
                      <p className="text-xl font-bold">{order._id}</p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)} {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-3">Items Ordered:</h3>
                    <div className="space-y-2">
                      {order.orderItems?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-slate-800 p-3 rounded"
                        >
                          <div>
                            <p className="font-semibold text-slate-100">{item.name}</p>
                            <p className="text-sm text-slate-300">Quantity: {item.qty}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400">₹{item.price}</p>
                            <p className="text-sm text-slate-300">
                              Subtotal: ₹{item.price * item.qty}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Meta */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-slate-800 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Total Price</p>
                      <p className="text-xl font-bold text-emerald-400">₹{order.totalPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Payment Status</p>
                      <p className="font-semibold text-slate-100">
                        {order.isPaid ? "✅ Paid" : "⏳ Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Ordered On</p>
                      <p className="font-semibold text-slate-100">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Expected Delivery</p>
                      <p className="font-semibold text-slate-100">
                        {order.expectedDeliveryDate
                          ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                          : "To be decided"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 rounded-lg border border-cyan-100/10 bg-slate-800 p-4">
                    <p className="text-xs text-slate-400 uppercase mb-2">Shipping Address</p>
                    <p className="text-sm text-slate-100 font-semibold">{order.shippingAddress?.fullName}</p>
                    <p className="text-sm text-slate-300">{order.shippingAddress?.phone}</p>
                    <p className="text-sm text-slate-300">{order.shippingAddress?.addressLine}</p>
                    <p className="text-sm text-slate-300">
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                    </p>
                    <p className="text-sm text-slate-300">{order.shippingAddress?.country}</p>
                    <p className="text-xs text-cyan-300 mt-2 uppercase">Payment Method: {order.paymentMethod || "card"}</p>
                  </div>

                  {/* Status Timeline */}
                  <div className="border-t border-slate-700 pt-4">
                    <h4 className="font-bold text-slate-100 mb-3">Order Status:</h4>
                    <div className="flex items-center gap-2">
                      {order.status === "pending" && (
                        <div className="flex items-center text-yellow-600">
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                          <span className="text-sm font-semibold">
                            Waiting for confirmation...
                          </span>
                        </div>
                      )}
                      {order.status === "confirmed" && (
                        <div>
                          <div className="flex items-center text-green-600 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm font-semibold">
                              ✅ Order Confirmed!
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 ml-5">
                            Your order has been confirmed. Expected delivery:{" "}
                            <span className="font-bold">
                              {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      )}
                      {order.status === "shipped" && (
                        <div className="flex items-center text-blue-600">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-sm font-semibold">
                            🚚 Your order is on the way!
                          </span>
                        </div>
                      )}
                      {order.status === "delivered" && (
                        <div className="flex items-center text-purple-600">
                          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                          <span className="text-sm font-semibold">
                            📦 Delivered! Thank you for your purchase.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;