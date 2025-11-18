import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch featured movies from database
  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/api/v1/films", {
          headers: {
            'Accept': "application/json",
          },
        });

        console.log('API Response:', response.data); // Debug log

        let filmsData = [];
        
        // Handle different response structures
        if (response.data.success && Array.isArray(response.data.data)) {
          filmsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          filmsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          filmsData = response.data.data;
        }

        // Filter featured movies (playing status with highest ratings)
        const playingFilms = filmsData
          .filter(film => film.status?.toLowerCase() === 'playing')
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3); // Take top 3 rated films

        setFeaturedMovies(playingFilms);
        setError(null);
      } catch (err) {
        console.error("Error fetching featured movies:", err);
        setError("Gagal memuat data film");
        // Fallback to default movies if API fails
        setFeaturedMovies([
          {
            id: 1,
            title: "Deadpool & Wolverine",
            image: "https://assets-prd.ignimgs.com/2024/07/22/deadpool-wolverine-poster-ign-1721666234978.jpg",
            rating: "8.9",
            genre: "Action, Comedy",
          },
          {
            id: 2,
            title: "Inside Out 2",
            image: "https://image.tmdb.org/t/p/w500/mFZ1N7qFpiKUpJjyKXz7nN2T8rK.jpg",
            rating: "8.3",
            genre: "Animation, Family",
          },
          {
            id: 3,
            title: "Dune: Part Two",
            image: "https://image.tmdb.org/t/p/w500/8bcoRX3hQRHufLPSDREdvr3YMXx.jpg",
            rating: "9.1",
            genre: "Sci-Fi, Drama",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMovies();
  }, []);

  // Format rating untuk ditampilkan
  const renderStars = (rating) => {
    if (!rating || rating === 0) return "⏳ TBA";
    const stars = Math.floor(parseFloat(rating) / 2);
    return "⭐".repeat(stars > 5 ? 5 : stars) + " " + rating.toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.1),transparent_50%)]">
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,69,0,0.1),transparent_50%)]">
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-orange-500 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
        </div>

        <div className="relative z-10 text-center px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Main Title */}
          <div className="mb-6 sm:mb-8 lg:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl mb-3 sm:mb-0 sm:mr-4 animate-bounce">
                <span className="text-xl sm:text-2xl">🎬</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent leading-tight">
                Vision<span className="text-red-500">X</span>
              </h1>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Cinema Experience
            </div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-4xl mx-auto px-2">
              Nikmati pengalaman menonton yang tak terlupakan dengan teknologi terdepan dan kualitas premium
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 lg:mb-16 px-4">
            <Link
              to="/films"
              className="group relative w-full max-w-sm sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl text-sm sm:text-base overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                🎟️ Beli Tiket Sekarang
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/films"
              className="group w-full max-w-sm sm:w-auto border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base backdrop-blur-sm bg-black/20"
            >
              <span className="flex items-center justify-center">
                📽️ Jelajahi Film
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 text-center max-w-5xl mx-auto px-4">
            {[
              [`${featuredMovies.length}+`, "Film Tersedia", "🎬"],
              ["8", "Studio Premium", "🏢"],
              ["4DX", "Experience", "🎪"],
              ["IMAX", "Technology", "📽️"],
            ].map(([value, label, icon], index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2 group-hover:animate-bounce">{icon}</div>
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-yellow-400 mb-1">
                  {value}
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-300">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-xl mb-2 sm:mb-0 sm:mr-3">
                <span className="text-lg sm:text-xl">🌟</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400">
                Film Unggulan
              </h2>
            </div>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed px-4">
              Temukan film-film terpopuler dan terbaru yang sedang tayang di bioskop kami dengan kualitas premium
            </p>
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg max-w-md mx-auto mt-4">
                {error} - Menampilkan data contoh
              </div>
            )}
          </div>

          {featuredMovies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">🎬</div>
              <h3 className="text-xl sm:text-2xl text-gray-400 mb-2">Belum Ada Film</h3>
              <p className="text-gray-500 text-sm sm:text-base">Tidak ada film yang sedang tayang saat ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredMovies.map((movie) => (
                <Link key={movie.id} to={`/movie/${movie.id}`} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl backdrop-blur-sm">
                    <div className="relative overflow-hidden">
                      <img
                        src={movie.poster || movie.image || "https://via.placeholder.com/300x400/1f2937/6b7280?text=No+Poster"}
                        alt={movie.title}
                        className="w-full h-64 sm:h-72 lg:h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x400/1f2937/6b7280?text=No+Poster";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl border border-yellow-500/50">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400 text-sm">⭐</span>
                          <span className="font-bold text-xs sm:text-sm">
                            {movie.rating ? movie.rating.toFixed(1) : "TBA"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 line-clamp-2">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-gray-300 text-xs sm:text-sm bg-black/50 px-2 sm:px-3 py-1 rounded-full">
                          {movie.genre}
                        </span>
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm group-hover:scale-110 transition-transform duration-300">
                          Tonton
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/films"
              className="group inline-flex items-center bg-gradient-to-r from-gray-800 to-gray-700 hover:from-yellow-500 hover:to-orange-500 text-white hover:text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 border border-gray-600 hover:border-transparent text-base sm:text-lg font-semibold transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              <span>Lihat Semua Film</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-xl mb-2 sm:mb-0 sm:mr-3">
                <span className="text-lg sm:text-xl">🎯</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400">
                Mengapa VisionX?
              </h2>
            </div>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-4xl mx-auto leading-relaxed px-4">
              Nikmati fasilitas dan layanan terbaik yang dirancang khusus untuk memberikan pengalaman menonton yang tak terlupakan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              ["🔊", "Dolby Atmos", "Suara surround 360° yang memukau"],
              ["🎪", "4DX Experience", "Rasakan sensasi gerak dan efek khusus"],
              ["📱", "Online Booking", "Pesan tiket kapan saja, dimana saja"],
              ["🍿", "Premium Snacks", "Camilan berkualitas untuk pengalaman lengkap"],
            ].map(([icon, title, desc], index) => (
              <div
                key={index}
                className="group text-center p-4 sm:p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl sm:rounded-2xl border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl backdrop-blur-sm"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:animate-bounce">{icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-12 sm:w-20 h-12 sm:h-20 border-2 border-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-10 sm:w-16 h-10 sm:h-16 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-8 sm:w-12 h-8 sm:h-12 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-40 right-10 w-16 sm:w-24 h-16 sm:h-24 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-4 sm:mb-6 leading-tight px-2">
              Siap untuk Pengalaman
              <br className="hidden sm:block" />
              <span className="bg-white/20 px-3 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl text-xl sm:text-2xl lg:text-3xl xl:text-4xl">Menonton Terbaik?</span>
            </h2>
            <p className="text-black/80 text-sm sm:text-base lg:text-lg xl:text-xl mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
              Bergabunglah dengan ribuan penonton yang telah merasakan keajaiban VisionX Cinema
            </p>
          </div>
          
          <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center px-4">
            <Link
              to="/films"
              className="group bg-black hover:bg-gray-800 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl text-sm sm:text-base lg:text-lg flex items-center w-full max-w-sm sm:w-auto"
            >
              <span className="text-lg sm:text-xl mr-2 sm:mr-3">🎬</span>
              <span className="flex-1 sm:flex-none">Mulai Menonton Sekarang</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
            <Link
              to="/contact"
              className="bg-white/20 hover:bg-white/30 text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 backdrop-blur-sm border border-white/30 text-sm sm:text-base lg:text-lg w-full max-w-sm sm:w-auto text-center"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;