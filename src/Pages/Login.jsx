import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      const { token, user } = response.data;

      // Simpan token ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userRole", user.role || 'user');

      // 🔥 Tambahkan event agar Navbar tahu user sudah login
      window.dispatchEvent(new Event("userChanged"));

      setSuccess("Login berhasil! Mengalihkan...");
      setTimeout(() => {
        // Redirect berdasarkan role
        if (user.role === 'admin') {
          navigate("/admin");
        } else if (user.role === 'cashier' || user.role === 'kasir') {
          navigate("/cashier");
        } else if (user.role === 'owner') {
          navigate("/owner");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Email atau password salah.');
      } else if (err.response?.status === 422) {
        setError('Masukkan email dan password dengan benar.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Tidak dapat terhubung ke server. Pastikan Laravel backend berjalan.');
      } else {
        setError('Terjadi kesalahan server. Coba lagi nanti.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="bg-gray-950 min-h-screen py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 mb-4 sm:mb-6"
          >
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
              <span className="text-lg sm:text-xl font-black text-black">
                🎬
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-extrabold text-yellow-400">
                Vision
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-red-500 ml-1">
                X
              </span>
            </div>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Side - Login Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-900 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-800 shadow-2xl">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Masuk ke Akun
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  Silakan masuk untuk melanjutkan
                </p>
              </div>

              {/* Pesan sukses / error */}
              {error && (
                <div className="mb-4 p-3 bg-red-800/50 border border-red-600 text-red-300 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-800/50 border border-green-600 text-green-300 rounded-lg text-sm text-center">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors text-sm sm:text-base"
                    placeholder="nama@email.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors text-sm sm:text-base"
                      placeholder="Masukkan password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 sm:right-3 top-2.5 sm:top-3 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-sm">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="rounded border-gray-600 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span>Ingat saya</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Lupa password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-2.5 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Memproses..." : "🎬 Masuk Sekarang"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-4 sm:my-6 flex items-center">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-4 text-gray-400 text-sm">atau</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              {/* Social Login */}
              <div className="space-y-2 sm:space-y-3">
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2.5 sm:py-3 rounded-lg transition-colors border border-gray-700 hover:border-gray-600 text-sm sm:text-base">
                  📱 Masuk dengan Google
                </button>
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2.5 sm:py-3 rounded-lg transition-colors border border-gray-700 hover:border-gray-600 text-sm sm:text-base">
                  📘 Masuk dengan Facebook
                </button>
              </div>

              {/* Register Link */}
              <div className="text-center mt-4 sm:mt-6">
                <span className="text-gray-400 text-sm sm:text-base">
                  Belum punya akun?{" "}
                </span>
                <Link
                  to="/register"
                  className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors text-sm sm:text-base"
                >
                  Daftar sekarang
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Welcome Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Selamat Datang Kembali di{" "}
                <span className="text-yellow-400">VisionX</span>
                <span className="text-red-500">Cinema</span>!
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                Nikmati pengalaman menonton terbaik dengan teknologi terdepan
                dan layanan premium yang tak terlupakan.
              </p>
            </div>

            <div className="bg-gray-900/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-800 mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-yellow-400 mb-3 sm:mb-4">
                🎯 Keuntungan Member VisionX
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-lg sm:text-xl">✓</span>
                  <span className="text-gray-300 text-sm sm:text-base">
                    Booking tiket lebih mudah dan cepat
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-lg sm:text-xl">✓</span>
                  <span className="text-gray-300 text-sm sm:text-base">
                    Dapatkan poin reward setiap pembelian
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-lg sm:text-xl">✓</span>
                  <span className="text-gray-300 text-sm sm:text-base">
                    Akses eksklusif ke promo dan diskon
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-lg sm:text-xl">✓</span>
                  <span className="text-gray-300 text-sm sm:text-base">
                    Notifikasi film terbaru dan jadwal tayang
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-900/50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-800 text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                  50K+
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  Member Aktif
                </div>
              </div>
              <div className="bg-gray-900/50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-800 text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                  4.9
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  Rating Aplikasi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
