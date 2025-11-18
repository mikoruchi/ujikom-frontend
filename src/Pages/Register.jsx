import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    subscribeNewsletter: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Handle input perubahan
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // 🔹 Fungsi submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Password tidak cocok!");
      return;
    }

    if (!formData.agreeTerms) {
      alert("Anda harus menyetujui syarat dan ketentuan!");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        }
      );

      console.log(response.data);

      alert("Registrasi berhasil! Selamat datang di VisionX Cinema!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errors) {
        // tampilkan error validasi dari Laravel
        const firstError = Object.values(error.response.data.errors)[0][0];
        alert(firstError);
      } else {
        alert("Registrasi gagal! Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
              <span className="text-xl font-black text-black">🎬</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-extrabold text-yellow-400">Vision</span>
              <span className="text-2xl font-extrabold text-red-500 ml-1">X</span>
            </div>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Registration Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl max-w-2xl">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Daftar Akun Baru</h1>
                <p className="text-gray-400">Bergabunglah dengan VisionX Cinema</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 text-white px-3 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors text-sm"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 text-white px-3 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors text-sm"
                    placeholder="nama@email.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white px-3 py-2.5 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors text-sm"
                    placeholder="Opsional"
                  />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-800 text-white px-3 py-2.5 pr-10 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors text-sm"
                        placeholder="Min. 8 karakter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Konfirmasi Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-800 text-white px-3 py-2.5 pr-10 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors text-sm"
                        placeholder="Ulangi password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {showConfirmPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="space-y-2">
                  <label className="flex items-start space-x-2 text-xs text-gray-300">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      required
                      className="mt-0.5 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 w-4 h-4"
                    />
                    <span>
                      Saya menyetujui{" "}
                      <Link to="/terms" className="text-yellow-400 hover:text-yellow-300 underline">
                        Syarat & Ketentuan
                      </Link>{" "}
                      dan{" "}
                      <Link to="/privacy" className="text-yellow-400 hover:text-yellow-300 underline">
                        Kebijakan Privasi
                      </Link>{" "}
                      VisionX Cinema *
                    </span>
                  </label>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? "Mendaftarkan..." : "🎬 Daftar Sekarang"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-4 flex items-center">
                <div className="flex-1 border-t border-gray-700"></div>
                <span className="px-3 text-gray-400 text-xs">atau</span>
                <div className="flex-1 border-t border-gray-700"></div>
              </div>

              {/* Social Registration */}
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg transition-colors border border-gray-700 hover:border-gray-600 text-sm">
                  📱 Google
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg transition-colors border border-gray-700 hover:border-gray-600 text-sm">
                  📘 Facebook
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center mt-4">
                <span className="text-gray-400 text-sm">Sudah punya akun? </span>
                <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors text-sm">
                  Masuk di sini
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Info */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <div className="mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Bergabunglah dengan 
                <span className="text-yellow-400"> VisionX</span>
                <span className="text-red-500">Cinema</span>!
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Daftar sekarang dan nikmati pengalaman menonton yang tak terlupakan dengan berbagai keuntungan eksklusif.
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-8">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                🌟 Keuntungan Member VisionX
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300">Booking online 24/7</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300">Poin reward setiap transaksi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300">Akses promo eksklusif</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300">Notifikasi film terbaru</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                <div className="text-2xl font-bold text-yellow-400">50K+</div>
                <div className="text-xs text-gray-400">Member</div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                <div className="text-2xl font-bold text-yellow-400">8</div>
                <div className="text-xs text-gray-400">Studio</div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                <div className="text-2xl font-bold text-yellow-400">4.9</div>
                <div className="text-xs text-gray-400">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
