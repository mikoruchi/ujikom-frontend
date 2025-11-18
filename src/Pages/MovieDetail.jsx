import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, Star, Clock, Calendar, Heart, Share2 } from "lucide-react";
import axios from "axios";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTheater, setSelectedTheater] = useState("all");

  // Generate dates for the next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('id-ID', { month: 'short' })
      });
    }
    return dates;
  };

  const dates = generateDates();

  // Create axios instance
  const createApiInstance = () => {
    const instance = axios.create({
      baseURL: 'http://localhost:8000/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return instance;
  };

  // Fetch movie details - DIPERBAIKI STATUS HANDLING
  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const api = createApiInstance();
      const response = await api.get(`/films/${id}`);
      
      console.log('🎬 Movie Details Response:', response.data);
      
      if (response.data.success) {
        const movieData = response.data.data;
        
        // Debug: Lihat struktur data asli dari API
        console.log('📋 Raw movie data:', movieData);
        console.log('🔍 Status value:', movieData.status);
        console.log('🔍 Status type:', typeof movieData.status);
        
        // Normalize movie data structure dengan handling status yang benar
        const normalizedMovie = {
          id: movieData.id,
          title: movieData.title || 'Judul tidak tersedia',
          genre: movieData.genre || '',
          duration: movieData.duration || 0,
          rating: movieData.rating || 'N/A',
          poster: movieData.poster || '',
          trailer: movieData.trailer || '',
          synopsis: movieData.synopsis || 'Sinopsis tidak tersedia.',
          studio: movieData.studio || 'Studio tidak tersedia',
          // PERBAIKAN: Handle status dengan nilai yang sesuai database
          status: normalizeStatus(movieData.status),
          release_date: movieData.release_date || null
        };
        
        console.log('✅ Normalized movie status:', normalizedMovie.status);
        
        setMovie(normalizedMovie);
        
        // Set default selected date to today
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        
        // Fetch studios and showtimes
        await fetchStudios();
        await fetchShowtimes(normalizedMovie.id, today);
      } else {
        setError('Film tidak ditemukan');
      }
    } catch (error) {
      console.error('❌ Error fetching movie:', error);
      setError('Gagal memuat data film: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI BARU: Normalize status value - DIPERBAIKI
  const normalizeStatus = (status) => {
    if (!status) return 'Akan Datang';
    
    const statusStr = status.toString().trim();
    console.log('🔧 Normalizing status:', status, '->', statusStr);
    
    // Mapping nilai status dari database
    if (statusStr === 'Sedang Tayang' || statusStr === 'Playing' || statusStr === 'playing') {
      return 'Sedang Tayang';
    }
    if (statusStr === 'Akan Datang' || statusStr === 'Coming Soon' || statusStr === 'coming soon') {
      return 'Akan Datang';
    }
    
    // Default ke 'Akan Datang' jika tidak dikenali
    return 'Akan Datang';
  };

  // Fetch studios from API
  const fetchStudios = async () => {
    try {
      console.log('🔄 Fetching studios...');
      const api = createApiInstance();
      const response = await api.get('/studios-list');
      
      console.log('✅ Studios response:', response.data);

      if (response.data.success) {
        setStudios(response.data.data || []);
        console.log(`✅ Loaded ${response.data.data?.length || 0} studios`);
      } else {
        console.error('❌ Error from API:', response.data.message);
        setStudios([]);
      }
    } catch (err) {
      console.error('❌ Error fetching studios:', err);
      console.error('❌ Error details:', err.response?.data);
      setStudios([]);
    }
  };

  // Fetch showtimes for the movie
  const fetchShowtimes = async (movieId, date) => {
    try {
      setError(null);
      const api = createApiInstance();
      
      console.log('🔄 Fetching showtimes for movie:', movieId, 'date:', date);

      // Build params
      const params = {
        date: date
      };
      
      if (selectedTheater !== 'all') {
        params.studio_id = selectedTheater;
      }

      const response = await api.get('/jadwals/schedules', { params });
      
      console.log('✅ Schedules API Response:', response.data);

      if (response.data.success) {
        // Filter schedules untuk film yang sedang dilihat
        const movieSchedules = response.data.data.filter(schedule => {
          // Cek dengan berbagai kemungkinan field ID
          const scheduleMovieId = schedule.id || schedule.movie_id || schedule.film_id;
          const match = scheduleMovieId && scheduleMovieId.toString() === movieId.toString();
          if (match) {
            console.log('✅ Schedule matched:', schedule);
          }
          return match;
        });
        
        console.log(`✅ Filtered ${movieSchedules.length} showtimes for movie ${movieId}`);
        
        // Jika tidak ada jadwal, coba dengan pendekatan berbeda
        if (movieSchedules.length === 0) {
          console.log('⚠️ No direct matches, trying alternative approach...');
          
          // Coba cari berdasarkan judul film
          const movieTitle = movie?.title?.toLowerCase();
          const schedulesByTitle = response.data.data.filter(schedule => 
            schedule.movie?.toLowerCase().includes(movieTitle) || 
            schedule.title?.toLowerCase().includes(movieTitle)
          );
          
          if (schedulesByTitle.length > 0) {
            setShowtimes(schedulesByTitle);
            console.log(`✅ Found ${schedulesByTitle.length} schedules by title match`);
            return;
          }
        }
        
        setShowtimes(movieSchedules);
      } else {
        setShowtimes([]);
        console.error('❌ API Error:', response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching showtimes:', error);
      console.error('❌ Error details:', error.response?.data);
      setShowtimes([]);
    }
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (movie) {
      fetchShowtimes(movie.id, newDate);
    }
  };

  // Handle theater change
  const handleTheaterChange = (newTheater) => {
    setSelectedTheater(newTheater);
    if (movie && selectedDate) {
      fetchShowtimes(movie.id, selectedDate);
    }
  };

  // Handle buy ticket
  const handleBuyTicket = (schedule, showtime) => {
    if (!movie) return;
    
    console.log('🎫 Buying ticket for:', {
      movie: movie.title,
      schedule: schedule,
      showtime: showtime
    });

    // Navigate to seat selection page
    navigate(`/seat-selection`, {
      state: { 
        movie: { 
          id: movie.id,
          title: movie.title, 
          poster: movie.poster,
          genre: movie.genre,
          duration: movie.duration,
          rating: movie.rating
        },
        schedule: { 
          date: selectedDate, 
          time: showtime.time, 
          studio: showtime.studio_name || schedule.studio_name,
          studio_id: showtime.studio_id || schedule.studio_id,
          price: showtime.price || schedule.price,
          schedule_id: showtime.schedule_id || schedule.id
        }
      }
    });
  };

  // Format genre from string to array
  const formatGenres = (genreString) => {
    if (!genreString) return ['Unknown Genre'];
    return genreString.split(',').map(g => g.trim()).filter(g => g);
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return "TBA";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return "Rp 0";
    return `Rp ${parseInt(price).toLocaleString('id-ID')}`;
  };

  // Get age rating based on genre (simple logic)
  const getAgeRating = (genres) => {
    if (!genres || genres.length === 0) return 'SU';
    
    const genreList = genres.map(g => g.toLowerCase());
    if (genreList.some(g => ['horror', 'thriller', 'crime'].includes(g))) {
      return '17+';
    }
    if (genreList.some(g => ['action', 'war', 'violence'].includes(g))) {
      return '13+';
    }
    return 'SU';
  };

  // Format theaters for dropdown
  const theaters = [
    { id: "all", name: "Semua Studio" },
    ...(Array.isArray(studios) ? studios.map(studio => ({
      id: studio.id?.toString() || studio.studio_id?.toString(),
      name: `${studio.studio || studio.name} ${studio.description ? `(${studio.description})` : ''}`
    })).filter(studio => studio.id) : [])
  ];

  // Safe image URL
  const getSafeImageUrl = (url) => {
    if (!url || url.includes('via.placeholder.com') || url.trim() === '') {
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%236b7280'%3ENo Poster%3C/text%3E%3C/svg%3E`;
    }
    return url;
  };

  // FUNGSI BARU: Get status display text dan style - DIPERBAIKI
  const getStatusInfo = (status) => {
    const statusMap = {
      'Sedang Tayang': {
        text: 'Sedang Tayang',
        style: 'bg-green-500 text-white',
        badge: '🎬',
        buttonText: '🎟️ Beli Tiket',
        isPlaying: true
      },
      'Akan Datang': {
        text: 'Akan Datang',
        style: 'bg-yellow-500 text-black',
        badge: '📅',
        buttonText: '📅 Akan Datang',
        isPlaying: false
      }
    };
    
    return statusMap[status] || statusMap['Akan Datang'];
  };

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  useEffect(() => {
    if (movie && selectedDate) {
      console.log('🔄 Effect triggered - Date:', selectedDate, 'Theater:', selectedTheater);
      fetchShowtimes(movie.id, selectedDate);
    }
  }, [selectedDate, selectedTheater, movie]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Memuat data film...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Film Tidak Ditemukan</h2>
          <p className="text-gray-400 mb-4">{error || 'Film yang Anda cari tidak tersedia.'}</p>
          <Link
            to="/films"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
          >
            Kembali ke Daftar Film
          </Link>
        </div>
      </div>
    );
  }

  const genres = formatGenres(movie.genre);
  const ageRating = getAgeRating(genres);
  const statusInfo = getStatusInfo(movie.status);

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <img
          src={getSafeImageUrl(movie.poster)}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = getSafeImageUrl();
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent"></div>
        
        <Link
          to="/films"
          className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
        >
          ← Kembali
        </Link>
      </div>

      {/* Movie Info */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-20 lg:-mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Poster & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <img
                src={getSafeImageUrl(movie.poster)}
                alt={movie.title}
                className="w-full rounded-xl mb-6"
                onError={(e) => {
                  e.target.src = getSafeImageUrl();
                }}
              />
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    if (showtimes.length > 0 && statusInfo.isPlaying) {
                      document.getElementById('showtimes-section').scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    } else if (!statusInfo.isPlaying) {
                      alert('Film ini belum tayang. Status: ' + statusInfo.text);
                    } else {
                      alert('Belum ada jadwal tayang untuk film ini');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  {statusInfo.buttonText}
                </button>
                <div className="grid grid-cols-3 gap-2">
                  <button className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors">
                    <Heart className="mx-auto" />
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors">
                    <Share2 className="mx-auto" />
                  </button>
                  <button 
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors"
                    onClick={() => {
                      if (movie.trailer) {
                        document.getElementById('trailer-section').scrollIntoView({ 
                          behavior: 'smooth' 
                        });
                      } else {
                        alert('Trailer tidak tersedia');
                      }
                    }}
                  >
                    <Play className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Movie Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-800">
              <h1 className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                  <Star className="text-yellow-400" />
                  <span className="font-semibold">{movie.rating}</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                  <Clock className="text-gray-400" />
                  <span>{formatDuration(movie.duration)}</span>
                </div>
                <div className="bg-red-600 px-3 py-2 rounded-lg font-semibold">
                  {ageRating}
                </div>
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg">
                  <Calendar className="text-gray-400" />
                  <span>
                    {movie.release_date ? new Date(movie.release_date).toLocaleDateString('id-ID') : 'TBA'}
                  </span>
                </div>
              </div>

              {/* Status Display - DIPERBAIKI */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Status Tayang</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${statusInfo.style}`}>
                  <span className="mr-2">{statusInfo.badge}</span>
                  {statusInfo.text}
                </div>
                {!statusInfo.isPlaying && (
                  <p className="text-gray-400 text-sm mt-2">
                    Film ini akan segera tayang. Nantikan informasi lebih lanjut!
                  </p>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Genre</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g, index) => (
                    <span key={index} className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">Sinopsis</h3>
                <p className="text-gray-400 leading-relaxed">
                  {movie.synopsis}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">Studio</h3>
                  <p className="text-white">{movie.studio}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">Info</h3>
                  <p className="text-white">
                    Film {statusInfo.isPlaying ? 'sedang tayang' : 'akan datang'} di bioskop
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trailer */}
        {movie.trailer && (
          <div id="trailer-section" className="mt-8 bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">🎬 Trailer</h2>
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src={movie.trailer}
                title="Movie Trailer"
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Showtimes - HANYA TAMPIL JIKA STATUS SEDANG TAYANG */}
        {statusInfo.isPlaying && (
          <div id="showtimes-section" className="mt-8 bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">🎟️ Jadwal Tayang</h2>
            
            {/* Debug Info */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-yellow-400 font-semibold mb-2">Info Film:</h3>
              <p className="text-white text-sm">Movie ID: {movie.id}</p>
              <p className="text-white text-sm">Status: {movie.status} ({statusInfo.text})</p>
              <p className="text-white text-sm">Tanggal: {selectedDate}</p>
              <p className="text-white text-sm">Studio: {selectedTheater}</p>
              <p className="text-white text-sm">Jumlah Jadwal: {showtimes.length}</p>
            </div>
            
            {/* Date Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Pilih Tanggal</h3>
              <div className="flex justify-center">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {dates.map((date) => (
                    <button
                      key={date.date}
                      onClick={() => handleDateChange(date.date)}
                      className={`flex-shrink-0 p-4 rounded-xl text-center min-w-[80px] transition-all duration-300 ${
                        selectedDate === date.date
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <div className="text-xs font-medium">{date.day}</div>
                      <div className="text-lg font-bold">{date.dayNum}</div>
                      <div className="text-xs">{date.month}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Theater Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Pilih Studio</h3>
              <div className="flex justify-center">
                <select
                  value={selectedTheater}
                  onChange={(e) => handleTheaterChange(e.target.value)}
                  className="bg-gray-800 text-white px-6 py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  {theaters.map((theater) => (
                    <option key={theater.id} value={theater.id}>
                      {theater.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Showtimes Grid */}
            {showtimes.length > 0 ? (
              <div className="space-y-6">
                {showtimes.map((schedule, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-yellow-500 transition-colors"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">
                        {schedule.movie || schedule.title || movie.title}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>🎭 {schedule.genre || movie.genre}</p>
                        <p>⏱️ {formatDuration(schedule.duration || movie.duration)}</p>
                        <p>⭐ Rating: {schedule.rating || movie.rating || 'TBA'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {schedule.showtimes && schedule.showtimes.map((showtime, timeIndex) => (
                        <div
                          key={timeIndex}
                          className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-yellow-500 transition-colors text-center"
                        >
                          <div className="text-2xl font-bold text-yellow-400 mb-2">
                            {showtime.time}
                          </div>
                          <div className="text-sm text-gray-400 mb-2">
                            {showtime.studio_name || schedule.studio_name}
                          </div>
                          <div className="text-lg font-semibold text-green-400 mb-3">
                            {formatPrice(showtime.price || schedule.price)}
                          </div>
                          <div className="text-sm text-green-400 mb-3">
                            🪑 {showtime.available || 100} kursi tersisa
                          </div>
                          <button
                            onClick={() => handleBuyTicket(schedule, showtime)}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                          >
                            Pilih Kursi
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🎭</div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Belum Ada Jadwal Tayang</h3>
                <p className="text-gray-400">
                  {selectedTheater === 'all' 
                    ? `Tidak ada jadwal tayang untuk tanggal ${selectedDate}`
                    : `Tidak ada jadwal tayang untuk studio yang dipilih pada tanggal ${selectedDate}`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Message untuk film yang belum tayang */}
        {!statusInfo.isPlaying && (
          <div className="mt-8 bg-gray-900 rounded-2xl p-8 border border-yellow-500/30 text-center">
            <div className="text-yellow-400 text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Film Akan Segera Tayang</h2>
            <p className="text-gray-300 text-lg mb-4">
              Film <span className="font-semibold text-white">{movie.title}</span> akan segera tayang di bioskop.
            </p>
            <p className="text-gray-400">
              Nantikan informasi jadwal tayang dan pemesanan tiket di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;