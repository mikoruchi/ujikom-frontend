import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTheater, setSelectedTheater] = useState("all");
  const [schedules, setSchedules] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Create axios instance - TANPA AUTH untuk public routes
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

  // Fetch studios from API - TANPA AUTH
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
        setStudios([]);
        console.error('❌ Error from API:', response.data.message);
        setError('Gagal memuat data studio: ' + response.data.message);
      }
    } catch (err) {
      console.error('❌ Error fetching studios:', err);
      console.error('❌ Error details:', err.response?.data);
      setStudios([]);
      setError('Gagal memuat data studio: ' + (err.response?.data?.message || err.message));
    }
  };

  // Fetch schedules from API - TANPA AUTH
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiInstance();
      
      const params = {
        date: selectedDate
      };
      
      if (selectedTheater !== 'all') {
        params.studio_id = selectedTheater;
      }

      console.log('🔄 Fetching schedules with params:', params);

      const response = await api.get('/jadwals/schedules', { params });
      
      console.log('✅ Schedules API Response:', response.data);

      if (response.data.success) {
        setSchedules(response.data.data || []);
        console.log(`✅ Loaded ${response.data.data?.length || 0} schedules`);
      } else {
        setError(response.data.message || 'Gagal memuat jadwal');
        setSchedules([]);
        console.error('❌ API Error:', response.data.message);
      }
    } catch (err) {
      console.error('❌ Error fetching schedules:', err);
      console.error('❌ Error details:', err.response?.data);
      setError('Gagal memuat jadwal: ' + (err.response?.data?.message || err.message));
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Format theaters for dropdown
  const theaters = [
    { id: "all", name: "Semua Studio" },
    ...(Array.isArray(studios) ? studios.map(studio => ({
      id: studio.id.toString(),
      name: `${studio.studio} (${studio.description})`
    })) : [])
  ];

  const getTheaterName = (theaterId) => {
    if (theaterId === 'all') return "Semua Studio";
    const theater = theaters.find(t => t.id === theaterId);
    return theater ? theater.name : `Studio ${theaterId}`;
  };

  const getAvailabilityColor = (available) => {
    if (available > 100) return "text-green-400";
    if (available > 50) return "text-yellow-400";
    return "text-red-400";
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return "TBA";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return "Rp 0";
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  useEffect(() => {
    console.log('🔄 Effect triggered - Date:', selectedDate, 'Theater:', selectedTheater, 'Studios:', studios.length);
    if (studios.length > 0 || selectedTheater === 'all') {
      fetchSchedules();
    }
  }, [selectedDate, selectedTheater, studios]);

  if (loading) {
    return (
      <div className="bg-gray-950 text-white min-h-screen py-8 px-3 sm:px-4 lg:px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat jadwal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-400 mb-4">
            📅 Jadwal Tayang Film
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Pilih tanggal dan studio untuk melihat jadwal tayang film favorit Anda
          </p>
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-yellow-400 font-semibold mb-2">Debug Info:</h3>
          <p className="text-white text-sm">Jumlah Studio: {studios.length}</p>
          <p className="text-white text-sm">Jumlah Jadwal: {schedules.length}</p>
          <p className="text-white text-sm">Tanggal Terpilih: {selectedDate}</p>
          <p className="text-white text-sm">Studio Terpilih: {selectedTheater}</p>
          <p className="text-white text-sm">Status: {loading ? 'Loading...' : 'Siap'}</p>
        </div>

        {/* Date Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Pilih Tanggal</h2>
          <div className="flex justify-center">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {dates.map((date) => (
                <button
                  key={date.date}
                  onClick={() => setSelectedDate(date.date)}
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Pilih Studio</h2>
          <div className="flex justify-center">
            <select
              value={selectedTheater}
              onChange={(e) => setSelectedTheater(e.target.value)}
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
            <h3 className="font-semibold mb-2">❌ Error</h3>
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchStudios();
                fetchSchedules();
              }}
              className="mt-2 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Schedule Grid */}
        <div className="space-y-8">
          {schedules.length === 0 && !error ? (
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">🎬</div>
              <h3 className="text-xl sm:text-2xl text-gray-400 mb-2">Tidak Ada Jadwal</h3>
              <p className="text-gray-500 text-sm sm:text-base mb-4">
                {selectedTheater === 'all' 
                  ? `Tidak ada jadwal tayang untuk tanggal ${selectedDate}`
                  : `Tidak ada jadwal tayang untuk studio yang dipilih pada tanggal ${selectedDate}`
                }
              </p>
              <div className="space-y-2">
                <button 
                  onClick={fetchSchedules}
                  className="block mx-auto bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg"
                >
                  🔄 Muat Ulang
                </button>
                <p className="text-gray-400 text-sm">
                  Pastikan sudah ada data jadwal di database
                </p>
              </div>
            </div>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-yellow-500 transition-colors"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Movie Info */}
                  <div className="flex flex-col sm:flex-row gap-4 lg:w-1/3">
                    <img
                      src={schedule.poster || "https://via.placeholder.com/150x225/1f2937/6b7280?text=No+Poster"}
                      alt={schedule.movie}
                      className="w-24 h-36 object-cover rounded-lg mx-auto sm:mx-0"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150x225/1f2937/6b7280?text=No+Poster";
                      }}
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">
                        {schedule.movie}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>🎭 {schedule.genre}</p>
                        <p>⏱️ {formatDuration(schedule.duration)}</p>
                        <p>⭐ Rating: {schedule.rating || 'TBA'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Showtimes */}
                  <div className="lg:w-2/3">
                    <h4 className="text-lg font-semibold text-white mb-4">Jam Tayang:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {schedule.showtimes && schedule.showtimes.map((showtime, index) => (
                        <div
                          key={index}
                          className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-yellow-500 transition-colors"
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400 mb-1">
                              {showtime.time}
                            </div>
                            <div className="text-sm text-gray-400 mb-2">
                              {showtime.studio_name}
                            </div>
                            <div className="text-lg font-semibold text-green-400 mb-2">
                              {formatPrice(showtime.price)}
                            </div>
                            <div className={`text-sm mb-3 ${getAvailabilityColor(showtime.available)}`}>
                              🪑 {showtime.available} kursi tersisa
                            </div>
                            <Link
                              to="/seat-selection"
                              state={{ 
                                movie: { 
                                  title: schedule.movie, 
                                  poster: schedule.poster,
                                  genre: schedule.genre,
                                  duration: schedule.duration,
                                  rating: schedule.rating
                                },
                                schedule: { 
                                  date: selectedDate, 
                                  time: showtime.time, 
                                  studio: showtime.studio_name,
                                  studio_id: showtime.studio_id,
                                  price: showtime.price,
                                  schedule_id: showtime.schedule_id
                                }
                              }}
                              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm block text-center"
                            >
                              Pilih Kursi
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
              🎬 Jenis Studio
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Regular: Pengalaman menonton standar</p>
              <p>• Dolby Atmos: Suara surround premium</p>
              <p>• 4DX: Kursi bergerak + efek khusus</p>
              <p>• IMAX: Layar besar + kualitas terbaik</p>
              <p>• Premium: Kursi recliner + service</p>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
              💳 Metode Pembayaran
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Kartu Kredit/Debit</p>
              <p>• E-Wallet (GoPay, OVO, DANA)</p>
              <p>• Transfer Bank</p>
              <p>• QRIS</p>
              <p>• Tunai di kasir</p>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
              ℹ️ Informasi Penting
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Datang 15 menit sebelum film</p>
              <p>• Tiket tidak dapat direfund</p>
              <p>• Makanan dari luar dilarang</p>
              <p>• Wajib tunjukkan tiket digital</p>
              <p>• Patuhi protokol kesehatan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;