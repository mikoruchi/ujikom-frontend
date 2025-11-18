import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-9xl font-black text-yellow-400 mb-4 animate-bounce">
            404
          </div>
          <div className="text-6xl mb-6">🎬</div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari seperti film yang sudah tidak tayang lagi. 
          Mungkin sudah dipindahkan atau tidak pernah ada.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            to="/"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            🏠 Kembali ke Beranda
          </Link>
          <Link
            to="/films"
            className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300"
          >
            🎬 Lihat Film
          </Link>
        </div>

        {/* Suggestions */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4">
            💡 Mungkin Anda mencari:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <Link to="/" className="text-gray-300 hover:text-yellow-400 transition-colors">
              → Beranda
            </Link>
            <Link to="/films" className="text-gray-300 hover:text-yellow-400 transition-colors">
              → Daftar Film
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-yellow-400 transition-colors">
              → Hubungi Kami
            </Link>
            <Link to="/promo" className="text-gray-300 hover:text-yellow-400 transition-colors">
              → Promo Terbaru
            </Link>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8 text-gray-500 text-sm">
          <p>🍿 Sambil menunggu, mau nonton trailer film terbaru?</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;