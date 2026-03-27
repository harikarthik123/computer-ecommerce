import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import { CartContext } from "../context/CartContext";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    {
      title: "Laptops",
      subtitle: "Portable performance",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Desktop PCs",
      subtitle: "Power for workstations",
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Gaming Rigs",
      subtitle: "High FPS builds",
      image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Computer Accessories",
      subtitle: "Keyboards, mice and more",
      image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  const highlights = [
    {
      title: "Built for Performance",
      desc: "Every system is curated for speed, thermal balance, and long-term reliability for creators, students, and gamers."
    },
    {
      title: "Guided Buying Experience",
      desc: "Compare specifications, understand real-world use cases, and choose the right machine without confusion."
    },
    {
      title: "After-Sales Confidence",
      desc: "Transparent order tracking, expected delivery updates, and dependable support after purchase."
    }
  ];

  return (
    <div className="min-h-screen px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-900 p-8 text-white shadow-xl"
        >
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/30 blur-2xl" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-2xl" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Premium Computer Store</p>
            <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">Discover High-Performance Computers</h1>
            <p className="mt-3 text-slate-200">
              Smooth, elegant, and blazing fast shopping for laptops, desktops, and computer accessories.
            </p>
            <p className="mt-3 text-sm text-cyan-100/90">
              From everyday productivity machines to heavy-duty gaming and creative workstations, ShopX helps you find the right computer with clear specs and premium buying confidence.
            </p>
          </div>
        </motion.section>

        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-black text-slate-100">Shop Computer Categories</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className="group relative h-44 overflow-hidden rounded-2xl border border-white/15 shadow-lg shadow-black/25"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-sm font-black tracking-wide text-white">{cat.title}</p>
                  <p className="text-xs text-slate-200">{cat.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-cyan-100/10 bg-slate-900/40 p-6 backdrop-blur">
          <h2 className="text-2xl font-black text-white">About ShopX Computers</h2>
          <p className="mt-3 text-slate-200">
            ShopX is focused only on computers and computer hardware categories. We simplify technical choices by showing practical descriptions, core performance specs, and category-led guidance that matches real usage.
          </p>
          <p className="mt-2 text-slate-300">
            Whether you are buying your first laptop, assembling a gaming setup, or upgrading for professional workloads like design, development, video editing, or 3D work, our catalog is organized to help you compare faster and buy smarter.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {highlights.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-2xl border border-cyan-100/10 bg-slate-950/60 p-4"
              >
                <h3 className="text-lg font-bold text-cyan-300">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-100">Featured Computers</h2>
            <p className="text-sm font-semibold text-slate-300">{products.length} items</p>
          </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="overflow-hidden rounded-2xl border border-cyan-100/10 bg-slate-900/50 p-4 shadow-sm">
              <div className="h-44 animate-pulse rounded-xl bg-slate-700" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-700" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-700" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-700" />
            </div>
          ))
          : products.map((p) => (
            <ProductCard key={p._id} product={p} addToCart={addToCart} />
          ))}
      </div>
        </section>

        <section className="mt-8 rounded-3xl border border-cyan-100/10 bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 p-6">
          <h2 className="text-2xl font-black text-cyan-100">Why this store is computer-only</h2>
          <p className="mt-3 text-slate-200">
            We intentionally do not mix unrelated products. This keeps recommendations accurate, improves comparison quality, and ensures every listing, filter, and specification is tailored for computer buyers.
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-200 md:grid-cols-2">
            <li>• Focused catalog for laptops, desktop systems, and parts</li>
            <li>• Cleaner performance-first product descriptions</li>
            <li>• Better buying confidence for technical users</li>
            <li>• Faster discovery with category clarity</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Home;