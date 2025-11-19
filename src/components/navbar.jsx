import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, User, Menu, X, Bell, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Ambil user dari localStorage dan dengarkan perubahan user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    else setUser(null);

    // 🔹 Tambahkan listener agar user update otomatis tanpa refresh
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userChanged", handleStorageChange);
    };
  }, []);

  // ✅ Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsUserMenuOpen(false);
    window.dispatchEvent(new Event("userChanged"));
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/films?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl sticky top-0 z-50 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <span className="text-xl font-black text-black">🎬</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-extrabold text-yellow-400 tracking-wide">
                Vision
              </span>
              <span className="text-3xl font-extrabold text-red-500 ml-1">
                X
              </span>
            </div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden lg:flex items-center space-x-1 ml-8">
            {[
              { to: "/", label: "Beranda" },
              { to: "/films", label: "Film" },
              { to: "/schedule", label: "Jadwal" },
              { to: "/contact", label: "Kontak" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-700 ${
                    isActive
                      ? "bg-yellow-500 text-black font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="🔍 Cari film, genre, atau aktor..."
                className="w-full bg-gray-800/80 backdrop-blur-sm text-white placeholder-gray-400 pl-4 pr-10 py-2.5 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors"
              >
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4 ml-auto">
           

          

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black px-4 py-2 rounded-lg transition-all duration-300 font-medium"
              >
                <User size={18} />
                <span className="hidden md:block">
                  {user ? user.name : "Akun"}
                </span>
              </button>

              {/* Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                  {user ? (
                    <>
                      {/* Profile Section */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{user.name}</p>
                            <p className="text-gray-400 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <User size={16} className="mr-3" />
                        Profil Saya
                      </Link>
                      <Link
                        to="/booking-history"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <span className="mr-3">📋</span>
                        Riwayat Pemesanan
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                      >
                        <span className="mr-3">🚪</span>
                        Keluar
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                        Belum masuk? Silakan login
                      </div>
                      <Link
                        to="/login"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        🔑 Masuk
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 hover:text-yellow-300 transition-colors font-medium"
                      >
                        📝 Daftar Sekarang
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-gray-800/95 backdrop-blur-sm border-t border-gray-700">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="🔍 Cari film..."
                  className="w-full bg-gray-700 text-white placeholder-gray-400 pl-4 pr-10 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 text-gray-400"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>

            {/* Mobile Links */}
            {[
              { to: "/", icon: "🏠", label: "Beranda" },
              { to: "/films", icon: "🎬", label: "Film" },
              { to: "/schedule", icon: "📅", label: "Jadwal" },
              { to: "/contact", icon: "📞", label: "Kontak" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                {item.icon} {item.label}
              </NavLink>
            ))}

            {/* Auth Links */}
            <div className="border-t border-gray-700 pt-3 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all"
                  >
                    👤 Profil Saya
                  </Link>
                  <Link
                    to="/booking-history"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all"
                  >
                    📋 Riwayat Pemesanan
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 hover:text-red-300 rounded-lg transition-all"
                  >
                    🚪 Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    🔑 Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 bg-yellow-500 text-black hover:bg-yellow-600 rounded-lg transition-all font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    📝 Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
