import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
                <span className="text-xl font-black text-black">🎬</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-extrabold text-yellow-400">Vision</span>
                <span className="text-2xl font-extrabold text-red-500 ml-1">X</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Pengalaman menonton terbaik dengan teknologi terdepan dan layanan premium untuk semua kalangan.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <span className="text-xl">📘</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <span className="text-xl">📷</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <span className="text-xl">🐦</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <span className="text-xl">📺</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Menu Utama</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/films" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Film
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Jadwal
                </Link>
              </li>
              <li>
                <Link to="/promo" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Promo
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Layanan</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Booking Online
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Member Card
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Group Booking
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Private Screening
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Gift Card
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Kontak Kami</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-0.5">📍</span>
                <div>
                  <p className="text-gray-400 text-sm">
                    Jl. Sudirman No. 123<br />
                    Jakarta Pusat, DKI Jakarta
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">📞</span>
                <p className="text-gray-400 text-sm">(021) 1234-5678</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">✉️</span>
                <p className="text-gray-400 text-sm">info@visionxcinema.com</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">🕐</span>
                <p className="text-gray-400 text-sm">09:00 - 23:00 WIB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                &copy; 2024 VisionX Cinema. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Syarat & Ketentuan
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Kebijakan Privasi
              </Link>
              <Link to="/help" className="text-gray-400 hover:text-white transition-colors text-sm">
                Bantuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}