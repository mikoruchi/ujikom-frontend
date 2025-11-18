import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

const Films = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("nowShowing");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://127.0.0.1:8000/api/v1/films";

  // --- Handle search from URL params
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) setSearchTerm(searchQuery);
  }, [searchParams]);

  // --- Fetch films from backend
  useEffect(() => {
    const fetchFilms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Coba tanpa token dulu karena route films public
        const response = await axios.get(API_URL, {
          headers: {
            'Accept': "application/json",
          },
        });

        console.log('API Response:', response.data); // Debug log

        // Handle response structure
        if (response.data.success && Array.isArray(response.data.data)) {
          setFilms(response.data.data);
        } else if (Array.isArray(response.data)) {
          setFilms(response.data);
        } else {
          setFilms([]);
          setError('Format data tidak sesuai');
        }
      } catch (err) {
        console.error("Error fetching films:", err);
        setError('Gagal memuat data film');
        setFilms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  // --- Filter films berdasarkan tab, genre, search
  const filteredFilms = films.filter(film => {
    // Filter berdasarkan tab
    const tabMatch = activeTab === "nowShowing" 
      ? film.status?.toLowerCase() === 'playing' 
      : film.status?.toLowerCase() === 'upcoming';
    
    // Filter berdasarkan genre
    const genreMatch = selectedGenre === "all" || 
      film.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
    
    // Filter berdasarkan search
    const searchMatch = searchTerm === "" ||
      film.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      film.genre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return tabMatch && genreMatch && searchMatch;
  });

  // Genre list yang lengkap termasuk Horror
  const genres = [
    "all", "Action", "Horror", "Comedy", "Drama", "Sci-Fi", 
    "Romance", "Family", "Adventure", "Crime", "Animation", "Thriller"
  ];

  // Format rating untuk ditampilkan
  const renderStars = (rating) => {
    if (!rating || rating === 0) return "⏳ TBA";
    const stars = Math.floor(parseFloat(rating) / 2);
    return "⭐".repeat(stars > 5 ? 5 : stars) + " " + rating.toFixed(1);
  };

  // Format durasi
  const formatDuration = (minutes) => {
    if (!minutes) return "TBA";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format tanggal rilis
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">Memuat film...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h3 className="text-xl text-white mb-2">Gagal Memuat Data</h3>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      {/* Header */}
      <div className="text-center py-8 sm:py-12 px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-yellow-400 tracking-widest">
          Vision<span className="text-red-500 text-3xl sm:text-4xl lg:text-5xl">X</span> Films
        </h1>
        <p className="text-gray-400 mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
          {searchTerm ? `Hasil pencarian untuk "${searchTerm}"` : "Temukan film terbaru dan yang akan datang di bioskop kami!"}
        </p>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="mt-2 text-yellow-400 hover:text-yellow-300 text-sm underline"
          >
            Hapus pencarian
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="🔍 Cari film..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none text-sm sm:text-base"
          />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none text-sm sm:text-base min-w-0 sm:min-w-[180px]"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre === "all" ? "🎭 Semua Genre" : `🎬 ${genre}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center space-x-3 sm:space-x-6 mb-8 sm:mb-10 px-3 sm:px-4">
        <button
          onClick={() => setActiveTab("nowShowing")}
          className={`px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base lg:text-lg font-semibold transition transform hover:scale-105 ${
            activeTab === "nowShowing"
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg"
              : "bg-gray-800 hover:bg-gray-700 border border-gray-600"
          }`}
        >
          🎬 Sedang Tayang ({films.filter(f => f.status?.toLowerCase() === 'playing').length})
        </button>
        <button
          onClick={() => setActiveTab("comingSoon")}
          className={`px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base lg:text-lg font-semibold transition transform hover:scale-105 ${
            activeTab === "comingSoon"
              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
              : "bg-gray-800 hover:bg-gray-700 border border-gray-600"
          }`}
        >
          🔮 Segera Hadir ({films.filter(f => f.status?.toLowerCase() === 'upcoming').length})
        </button>
      </div>

      {/* Film Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-12 sm:pb-20">
        {filteredFilms.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-4">🎬</div>
            <h3 className="text-xl sm:text-2xl text-gray-400 mb-2">Film tidak ditemukan</h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Coba ubah filter atau genre'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
            <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredFilms.map((film) => (
                <div
                  key={film.id}
                  className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition duration-300 border border-gray-800 hover:border-yellow-500 group"
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={film.poster || "https://via.placeholder.com/300x400/1f2937/6b7280?text=No+Poster"} 
                      alt={film.title} 
                      className="w-full h-64 sm:h-72 lg:h-80 object-cover group-hover:scale-110 transition duration-500"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x400/1f2937/6b7280?text=No+Poster";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full border border-yellow-500">
                      {renderStars(film.rating)}
                    </div>
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                      ⏱️ {formatDuration(film.duration)}
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-2 line-clamp-2">{film.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm mb-3 flex items-center">
                      🎭 {film.genre} 
                      {film.studio && (
                        <span className="ml-2 bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                          {film.studio.studio}
                        </span>
                      )}
                    </p>
                    
                    {activeTab === "nowShowing" ? (
                      <div className="mb-4">
                        <p className="text-green-400 font-semibold text-sm sm:text-base mb-2">
                          🎟️ Tersedia di Bioskop
                        </p>
                        <Link 
                          to={`/schedule?film=${film.id}`}
                          className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold px-3 sm:px-4 py-2 rounded-lg transition transform hover:scale-105 shadow-lg text-xs sm:text-sm text-center"
                        >
                          Lihat Jadwal & Beli Tiket
                        </Link>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <p className="text-blue-400 font-semibold text-sm sm:text-base">
                          📅 Rilis: {formatDate(film.release_date)}
                        </p>
                        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg transition transform hover:scale-105 text-xs sm:text-sm mt-2">
                          🔔 Ingatkan Saya
                        </button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Link 
                        to={`/movie/${film.id}`} 
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg transition text-xs sm:text-sm text-center"
                      >
                        ℹ️ Detail Film
                      </Link>
                      {film.trailer && (
                        <a 
                          href={film.trailer} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition text-xs sm:text-sm"
                        >
                          ▶️ Trailer
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 order-first xl:order-last">
              <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800 xl:sticky xl:top-4">
                <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-3 sm:mb-4 flex items-center">📊 Info Bioskop</h3>
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                  <div className="bg-gray-800 p-2.5 sm:p-3 rounded-lg">
                    <h4 className="font-semibold text-white mb-1 sm:mb-2">🎬 Total Film</h4>
                    <p className="text-gray-300">{films.length} film di database</p>
                    <p className="text-green-400 text-xs">
                      {films.filter(f => f.status?.toLowerCase() === 'playing').length} sedang tayang
                    </p>
                  </div>
                  <div className="bg-gray-800 p-2.5 sm:p-3 rounded-lg">
                    <h4 className="font-semibold text-white mb-1 sm:mb-2">⏰ Jam Operasional</h4>
                    <p className="text-gray-300">09:00 - 23:00 WIB</p>
                  </div>
                  <div className="bg-gray-800 p-2.5 sm:p-3 rounded-lg">
                    <h4 className="font-semibold text-white mb-1 sm:mb-2">💳 Metode Pembayaran</h4>
                    <div className="text-gray-300 space-y-0.5 sm:space-y-1">
                      <p>• Tunai</p>
                      <p>• Kartu Debit/Kredit</p>
                      <p>• E-Wallet</p>
                      <p>• QRIS</p>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-2.5 sm:p-3 rounded-lg">
                    <h4 className="font-semibold text-white mb-1 sm:mb-2">🎯 Fasilitas</h4>
                    <div className="text-gray-300 space-y-0.5 sm:space-y-1">
                      <p>• Dolby Atmos</p>
                      <p>• 4DX Experience</p>
                      <p>• IMAX Screen</p>
                      <p>• Cafe & Snack Bar</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2.5 sm:p-3 rounded-lg text-black">
                    <h4 className="font-bold mb-1 sm:mb-2">🎉 Promo Hari Ini!</h4>
                    <p className="text-xs sm:text-sm font-semibold">Diskon 25% untuk member baru</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Films;