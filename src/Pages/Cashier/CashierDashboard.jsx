import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Clock, 
  Users, 
  CreditCard, 
  Printer,
  CheckCircle,
  XCircle,
  User,
  Phone
} from 'lucide-react';

const CashierDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [total, setTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sample data
  useEffect(() => {
    setMovies([
      { 
        id: 1, 
        title: 'Avengers: Endgame', 
        price: 50000,
        genre: 'Action, Adventure',
        duration: '3h 1m',
        rating: 8.4
      },
      { 
        id: 2, 
        title: 'Spider-Man: No Way Home', 
        price: 45000,
        genre: 'Action, Adventure',
        duration: '2h 28m',
        rating: 8.2
      },
      { 
        id: 3, 
        title: 'The Batman', 
        price: 55000,
        genre: 'Action, Crime',
        duration: '2h 56m',
        rating: 7.8
      },
      { 
        id: 4, 
        title: 'Avatar: The Way of Water', 
        price: 60000,
        genre: 'Adventure, Sci-Fi',
        duration: '3h 12m',
        rating: 7.6
      }
    ]);
  }, []);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setSelectedSchedule(null);
    setSeats([]);
    setSelectedSeats([]);
    
    setSchedules([
      { id: 1, time: '10:00', studio: 'Studio 1', type: '2D' },
      { id: 2, time: '13:00', studio: 'Studio 2', type: '3D' },
      { id: 3, time: '16:00', studio: 'Studio 1', type: '2D' },
      { id: 4, time: '19:00', studio: 'Studio 3', type: 'IMAX' }
    ]);
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    const seatList = [];
    
    // Generate seats with more realistic layout
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    rows.forEach(row => {
      for (let i = 1; i <= 12; i++) {
        const seatId = `${row}${i}`;
        const isVip = row === 'A' || row === 'B';
        seatList.push({
          id: seatId,
          number: i,
          row: row,
          available: Math.random() > 0.2,
          vip: isVip,
          price: isVip ? (selectedMovie?.price || 50000) + 20000 : selectedMovie?.price || 50000
        });
      }
    });
    setSeats(seatList);
  };

  const toggleSeat = (seat) => {
    if (!seat.available) return;
    
    if (selectedSeats.some(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  useEffect(() => {
    if (selectedSeats.length > 0) {
      const newTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
      setTotal(newTotal);
    } else {
      setTotal(0);
    }
  }, [selectedSeats]);

  const handlePayment = async () => {
    if (!customerInfo.name || !customerInfo.phone || selectedSeats.length === 0) {
      alert('Mohon lengkapi semua data dan pilih kursi');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      alert(`Pembayaran berhasil!\n\nDetail Transaksi:\nFilm: ${selectedMovie.title}\nJadwal: ${selectedSchedule.time} - ${selectedSchedule.studio}\nKursi: ${selectedSeats.map(s => s.id).join(', ')}\nTotal: Rp ${total.toLocaleString()}`);
      
      // Reset form
      setSelectedMovie(null);
      setSelectedSchedule(null);
      setSeats([]);
      setSelectedSeats([]);
      setCustomerInfo({ name: '', phone: '' });
      setTotal(0);
      setIsProcessing(false);
    }, 2000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <CreditCard className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Kasir Bioskop</h1>
          </div>
          <p className="text-gray-600 text-lg">Sistem pemesanan tiket bioskop untuk kasir</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Movie Selection */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Film className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Pilih Film</h2>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {movies.map(movie => (
                  <button
                    key={movie.id}
                    onClick={() => handleMovieSelect(movie)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                      selectedMovie?.id === movie.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">{movie.title}</h3>
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm font-semibold">
                        ⭐ {movie.rating}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{movie.genre}</p>
                      <p>⏱️ {movie.duration}</p>
                      <p className="text-green-600 font-semibold text-base">
                        Rp {formatPrice(movie.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Data Pelanggan</h2>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Nama Pelanggan"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full pl-10 p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  />
                </div>
                
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="tel"
                    placeholder="No. Telepon"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full pl-10 p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Selection */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-purple-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Pilih Jadwal</h2>
              </div>
              
              {selectedMovie ? (
                <div className="space-y-3">
                  {schedules.map(schedule => (
                    <button
                      key={schedule.id}
                      onClick={() => handleScheduleSelect(schedule)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                        selectedSchedule?.id === schedule.id 
                          ? 'border-purple-500 bg-purple-50 shadow-md' 
                          : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-2xl font-bold text-gray-800">{schedule.time}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          schedule.type === 'IMAX' ? 'bg-red-500 text-white' :
                          schedule.type === '3D' ? 'bg-blue-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {schedule.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {schedule.studio} • Harga normal
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Film className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-500">Pilih film terlebih dahulu</p>
                </div>
              )}
            </div>
          </div>

          {/* Seat Selection & Payment */}
          <div className="xl:col-span-2 space-y-6">
            {/* Seat Map */}
            {selectedSchedule && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                  Pilih Kursi - {selectedSchedule.studio}
                </h2>
                
                {/* Screen */}
                <div className="mb-8 text-center">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 px-12 rounded-lg inline-block transform -skew-x-12 shadow-lg">
                    <span className="transform skew-x-12 block">L A Y A R</span>
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="max-w-2xl mx-auto mb-8">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(row => (
                    <div key={row} className="flex justify-center gap-2 mb-3">
                      <div className="w-6 flex items-center justify-center text-sm font-semibold text-gray-600">
                        {row}
                      </div>
                      {seats
                        .filter(seat => seat.row === row)
                        .map(seat => (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat)}
                            disabled={!seat.available}
                            className={`w-8 h-8 text-xs font-bold rounded-lg transition-all duration-200 transform hover:scale-110 ${
                              !seat.available 
                                ? 'bg-red-400 cursor-not-allowed' 
                                : selectedSeats.some(s => s.id === seat.id)
                                  ? seat.vip 
                                    ? 'bg-yellow-500 text-white shadow-lg scale-110'
                                    : 'bg-blue-600 text-white shadow-lg scale-110'
                                  : seat.vip
                                    ? 'bg-yellow-100 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-green-200 border-2 border-green-400 text-green-700 hover:bg-green-300'
                            }`}
                            title={seat.vip ? `VIP - Rp ${formatPrice(seat.price)}` : `Regular - Rp ${formatPrice(seat.price)}`}
                          >
                            {seat.number}
                          </button>
                        ))
                      }
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded"></div>
                    <span>Regular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
                    <span>VIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span>Dipilih</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span>Terisi</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Pembayaran</h2>
              
              {selectedMovie && selectedSchedule && selectedSeats.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Film</p>
                      <p className="font-semibold">{selectedMovie.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Jadwal</p>
                      <p className="font-semibold">{selectedSchedule.time} - {selectedSchedule.studio}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 mb-2">Kursi Dipilih</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(seat => (
                        <span 
                          key={seat.id}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            seat.vip 
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {seat.id} {seat.vip && '(VIP)'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    {selectedSeats.map(seat => (
                      <div key={seat.id} className="flex justify-between text-sm mb-2">
                        <span>Kursi {seat.id} {seat.vip && '(VIP)'}</span>
                        <span>Rp {formatPrice(seat.price)}</span>
                      </div>
                    ))}
                    
                    <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t">
                      <span>Total Pembayaran</span>
                      <span className="text-green-600">Rp {formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={!customerInfo.name || !customerInfo.phone || isProcessing}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Printer size={20} />
                        Bayar & Cetak Tiket
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="mx-auto mb-3 text-gray-400" size={48} />
                  <p>Pilih film, jadwal, dan kursi untuk melihat ringkasan pembayaran</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;