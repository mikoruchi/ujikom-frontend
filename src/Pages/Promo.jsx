import React, { useState } from "react";
import { Link } from "react-router-dom";

const Promo = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const promos = [
    {
      id: 1,
      title: "Diskon 50% Film Terbaru",
      description: "Dapatkan diskon hingga 50% untuk semua film yang sedang tayang",
      discount: "50%",
      validUntil: "31 Des 2024",
      category: "discount",
      code: "FILM50",
      image: "https://images.unsplash.com/photo-1489599735734-79b4169c4388?w=400&h=250&fit=crop",
      terms: ["Berlaku untuk semua film", "Maksimal 4 tiket per transaksi", "Tidak dapat digabung dengan promo lain"]
    },
    {
      id: 2,
      title: "Buy 1 Get 1 Popcorn",
      description: "Beli 1 popcorn large gratis 1 popcorn regular + minuman",
      discount: "BOGO",
      validUntil: "15 Jan 2025",
      category: "food",
      code: "POPCORN1",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop",
      terms: ["Berlaku untuk popcorn large", "Gratis 1 popcorn regular", "Berlaku setiap hari"]
    },
    {
      id: 3,
      title: "Member Gold Cashback 25%",
      description: "Cashback 25% untuk member Gold setiap pembelian tiket",
      discount: "25%",
      validUntil: "Permanent",
      category: "member",
      code: "GOLD25",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
      terms: ["Khusus member Gold", "Cashback maksimal Rp 50.000", "Berlaku untuk semua film"]
    },
    {
      id: 4,
      title: "Weekend Special 30% Off",
      description: "Diskon khusus weekend untuk semua jadwal Sabtu-Minggu",
      discount: "30%",
      validUntil: "Setiap Weekend",
      category: "discount",
      code: "WEEKEND30",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=250&fit=crop",
      terms: ["Berlaku Sabtu-Minggu", "Semua jadwal film", "Maksimal 6 tiket"]
    },
    {
      id: 5,
      title: "Student Discount 40%",
      description: "Diskon pelajar dengan menunjukkan kartu pelajar/mahasiswa",
      discount: "40%",
      validUntil: "31 Mar 2025",
      category: "student",
      code: "STUDENT40",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop",
      terms: ["Wajib tunjukkan kartu pelajar", "Berlaku Senin-Jumat", "Jam tayang sebelum 17:00"]
    },
    {
      id: 6,
      title: "Combo Hemat Keluarga",
      description: "Paket hemat 4 tiket + 2 popcorn + 4 minuman",
      discount: "Rp 200.000",
      validUntil: "28 Feb 2025",
      category: "package",
      code: "FAMILY4",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop",
      terms: ["Paket untuk 4 orang", "Hemat hingga Rp 100.000", "Berlaku semua hari"]
    }
  ];

  const categories = [
    { id: "all", name: "Semua Promo", icon: "🎯" },
    { id: "discount", name: "Diskon Tiket", icon: "🎟️" },
    { id: "food", name: "F&B Promo", icon: "🍿" },
    { id: "member", name: "Member Special", icon: "⭐" },
    { id: "student", name: "Student", icon: "🎓" },
    { id: "package", name: "Paket Hemat", icon: "📦" }
  ];

  const filteredPromos = activeCategory === "all" 
    ? promos 
    : promos.filter(promo => promo.category === activeCategory);

  return (
    <div className="bg-gray-950 text-white min-h-screen py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-400 mb-4">
            🎉 Promo & Penawaran Spesial
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Jangan lewatkan penawaran menarik dari VisionX Cinema! Hemat lebih banyak dengan promo eksklusif kami.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPromos.map((promo) => (
            <div
              key={promo.id}
              className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-yellow-500 transition-all duration-300 transform hover:scale-105 group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                  {promo.discount} OFF
                </div>
                
                {/* Valid Until */}
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                  📅 Berlaku hingga {promo.validUntil}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">
                  {promo.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {promo.description}
                </p>

                {/* Promo Code */}
                <div className="bg-gray-800 p-3 rounded-lg mb-4 border border-dashed border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Kode Promo:</span>
                    <button className="text-xs text-yellow-400 hover:text-yellow-300">
                      📋 Salin
                    </button>
                  </div>
                  <div className="text-lg font-bold text-white tracking-wider">
                    {promo.code}
                  </div>
                </div>

                {/* Terms */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Syarat & Ketentuan:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {promo.terms.map((term, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Link
                  to="/films"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-center block"
                >
                  🎬 Gunakan Promo
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 rounded-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
            📧 Jangan Lewatkan Promo Terbaru!
          </h2>
          <p className="text-black/80 mb-6 max-w-2xl mx-auto">
            Daftarkan email Anda dan dapatkan notifikasi promo eksklusif, diskon spesial, dan penawaran terbatas langsung di inbox Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-3 rounded-lg text-black border-none focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Berlangganan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promo;