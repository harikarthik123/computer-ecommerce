import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      await API.post("/auth/register", form);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Join ShopX</h1>
            <p className="text-gray-500">Create your account and start shopping</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              ❌ {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              ✅ {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">Min. 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t-2 border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">Already have an account?</span>
            <div className="flex-1 border-t-2 border-gray-300"></div>
          </div>

          {/* Sign In Link */}
          <Link to="/login">
            <button className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition">
              Sign In
            </button>
          </Link>

          {/* Terms */}
          <p className="mt-6 text-xs text-gray-600 text-center">
            By creating an account, you agree to our <br />
            <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;