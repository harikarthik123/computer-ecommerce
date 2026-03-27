import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import API from "../services/api";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    images: ""
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", name: "", price: "", description: "", images: "" });

  const [confirmingOrder, setConfirmingOrder] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState("");

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data || []);
  };

  const fetchOrders = async () => {
    const res = await API.get("/orders", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setOrders(res.data || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchOrders()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
    const paidOrders = orders.filter((o) => o.isPaid).length;
    const unpaidOrders = orders.filter((o) => !o.isPaid).length;
    const totalRevenue = orders
      .filter((o) => ["confirmed", "delivered"].includes(o.status))
      .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      paidOrders,
      unpaidOrders,
      totalRevenue,
      recentOrders: [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
    };
  }, [products, orders]);

  const addProduct = async () => {
    if (!form.name || !form.price || !form.images) {
      alert("Please fill all required fields");
      return;
    }

    await API.post(
      "/products",
      {
        ...form,
        price: Number(form.price),
        images: form.images.split(",").map((img) => img.trim())
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setForm({ name: "", price: "", description: "", images: "" });
    setSuccessMsg("Product added successfully.");
    setTimeout(() => setSuccessMsg(""), 2400);
    await fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await API.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchProducts();
  };

  const openEditModal = (product) => {
    setEditForm({
      id: product._id,
      name: product.name || "",
      price: product.price || "",
      description: product.description || "",
      images: (product.images || []).join(", ")
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    await API.put(
      `/products/${editForm.id}`,
      {
        name: editForm.name,
        price: Number(editForm.price),
        description: editForm.description,
        images: editForm.images.split(",").map((img) => img.trim())
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEditModalOpen(false);
    setSuccessMsg("Product updated.");
    setTimeout(() => setSuccessMsg(""), 2400);
    await fetchProducts();
  };

  const confirmOrder = async (orderId) => {
    if (!deliveryDate) {
      alert("Please select expected delivery date");
      return;
    }

    await API.put(
      `/orders/${orderId}/confirm`,
      { expectedDeliveryDate: deliveryDate },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setConfirmingOrder(null);
    setDeliveryDate("");
    setSuccessMsg("Order confirmed.");
    setTimeout(() => setSuccessMsg(""), 2400);
    await fetchOrders();
  };

  const markOrderPaid = async (orderId) => {
    await API.put(
      `/orders/${orderId}/mark-paid`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSuccessMsg("Payment status updated to PAID.");
    setTimeout(() => setSuccessMsg(""), 2400);
    await fetchOrders();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm transition hover:shadow"
              aria-label="Open dashboard menu"
            >
              <span className="block h-0.5 w-5 bg-slate-700" />
              <span className="mt-1 block h-0.5 w-5 bg-slate-700" />
              <span className="mt-1 block h-0.5 w-5 bg-slate-700" />
            </button>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Admin Control Center</h1>
          </div>
          <p className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Live Report</p>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/30"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed left-0 top-0 z-50 h-full w-72 border-r border-slate-200 bg-white p-5 shadow-2xl"
            >
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Navigation</h2>
              <div className="space-y-2">
                {[
                  ["overview", "Overview"],
                  ["products", "Products"],
                  ["orders", "Orders"]
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      setMenuOpen(false);
                    }}
                    className={`w-full rounded-xl px-4 py-3 text-left font-semibold transition ${
                      activeTab === key
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === "overview" && (
          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">Consolidated Visual Report</h2>
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Computers</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{stats.totalProducts}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Orders</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{stats.totalOrders}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
                    <p className="mt-2 text-3xl font-black text-amber-600">{stats.pendingOrders}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmed</p>
                    <p className="mt-2 text-3xl font-black text-emerald-600">{stats.confirmedOrders}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revenue</p>
                    <p className="mt-2 text-3xl font-black text-cyan-700">₹{stats.totalRevenue}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid</p>
                    <p className="mt-2 text-3xl font-black text-emerald-600">{stats.paidOrders}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unpaid</p>
                    <p className="mt-2 text-3xl font-black text-rose-600">{stats.unpaidOrders}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900">Order Status Mix</h3>
                    <div className="mt-4 space-y-3">
                      {[
                        ["Pending", stats.pendingOrders, "bg-amber-500"],
                        ["Confirmed", stats.confirmedOrders, "bg-emerald-500"],
                        ["Delivered", stats.deliveredOrders, "bg-cyan-500"]
                      ].map(([label, value, bar]) => {
                        const width = stats.totalOrders > 0 ? Math.max((value / stats.totalOrders) * 100, 4) : 0;
                        return (
                          <div key={label}>
                            <div className="mb-1 flex justify-between text-sm font-medium text-slate-700">
                              <span>{label}</span>
                              <span>{value}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${width}%` }}
                                transition={{ duration: 0.5 }}
                                className={`h-2 rounded-full ${bar}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                    <div className="mt-4 space-y-2">
                      <button onClick={() => setActiveTab("products")} className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Manage Computers</button>
                      <button onClick={() => setActiveTab("orders")} className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Review Orders</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === "products" && (
          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">Computers</h2>

            <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="mb-3 text-lg font-bold text-slate-900">Add Computer</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Computer name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border border-slate-300 px-4 py-2"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="rounded-xl border border-slate-300 px-4 py-2"
                />
              </div>
              <textarea
                rows="3"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2"
              />
              <input
                type="text"
                placeholder="Image URLs (comma separated)"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2"
              />
              <button onClick={addProduct} className="mt-3 rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white">Add Computer</button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <motion.div key={p._id} whileHover={{ y: -4 }} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="h-44 overflow-hidden bg-slate-100">
                    <img src={p.images?.[0]} alt={p.name} className="h-full w-full object-cover transition duration-300 hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900">{p.name}</h3>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{p.description}</p>
                    <p className="mt-2 text-xl font-black text-emerald-600">₹{p.price}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => openEditModal(p)} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700">Edit</button>
                      <button onClick={() => deleteProduct(p._id)} className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600">Delete</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">Orders</h2>
            <div className="space-y-4">
              {orders
                .filter((o) => o.status === "pending")
                .map((order) => (
                  <div key={order._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">{order._id}</p>
                        <p className="font-bold text-slate-900">{order.user?.name}</p>
                        <p className="text-sm text-slate-600">{order.user?.email}</p>
                        <p className="text-xs text-slate-500 uppercase mt-1">Payment Method: {order.paymentMethod || "card"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">PENDING</p>
                        <p className={`rounded-full px-3 py-1 text-xs font-semibold ${order.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {order.isPaid ? "PAID" : "UNPAID"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      {order.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-slate-700">
                          <span>{item.name} x{item.qty}</span>
                          <span>₹{item.price * item.qty}</span>
                        </div>
                      ))}
                      <div className="mt-2 border-t border-slate-200 pt-2 text-right text-lg font-black text-slate-900">₹{order.totalPrice}</div>
                    </div>

                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">Shipment Address</p>
                      <p className="text-sm font-semibold text-slate-900">{order.shippingAddress?.fullName}</p>
                      <p className="text-sm text-slate-700">{order.shippingAddress?.phone}</p>
                      <p className="text-sm text-slate-700">{order.shippingAddress?.addressLine}</p>
                      <p className="text-sm text-slate-700">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                      </p>
                    </div>

                    {confirmingOrder === order._id ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="rounded-xl border border-slate-300 px-3 py-2"
                          min={new Date().toISOString().split("T")[0]}
                        />
                        <button onClick={() => confirmOrder(order._id)} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">Confirm</button>
                        <button onClick={() => setConfirmingOrder(null)} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button onClick={() => setConfirmingOrder(order._id)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Set Delivery & Confirm</button>
                        {!order.isPaid && order.paymentMethod === "cod" && (
                          <button onClick={() => markOrderPaid(order._id)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Mark Paid</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              {orders.filter((o) => o.status === "pending").length === 0 && (
                <p className="rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">No pending orders.</p>
              )}
            </div>
          </section>
        )}

        <AnimatePresence>
          {editModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditModalOpen(false)}
                className="fixed inset-0 z-40 bg-slate-900/40"
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
              >
                <h3 className="text-xl font-black text-slate-900">Edit Computer</h3>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Name" />
                  <input value={editForm.price} type="number" onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Price" />
                  <textarea rows="3" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Description" />
                  <input value={editForm.images} onChange={(e) => setEditForm({ ...editForm, images: e.target.value })} className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Images (comma separated)" />
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={saveEdit} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save</button>
                  <button onClick={() => setEditModalOpen(false)} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AdminDashboard;