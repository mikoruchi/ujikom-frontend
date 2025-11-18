import React, { useState, useEffect } from 'react';

const CashierDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setMovies([
      { id: 1, title: 'Avengers: Endgame', price: 50000 },
      { id: 2, title: 'Spider-Man', price: 45000 },
      { id: 3, title: 'Batman', price: 55000 }
    ]);
  }, []);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setSchedules([
      { id: 1, time: '10:00', studio: 'Studio 1' },
      { id: 2, time: '13:00', studio: 'Studio 2' },
      { id: 3, time: '16:00', studio: 'Studio 1' }
    ]);
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    const seatList = [];
    ['A', 'B'].forEach(row => {
      for (let i = 1; i <= 10; i++) {
        seatList.push({
          id: `${row}${i}`,
          available: Math.random() > 0.3
        });
      }
    });
    setSeats(seatList);
  };

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  useEffect(() => {
    if (selectedMovie && selectedSeats.length > 0) {
      setTotal(selectedMovie.price * selectedSeats.length);
    }
  }, [selectedMovie, selectedSeats]);

  const handlePayment = () => {
    if (!customerInfo.name || !customerInfo.phone || selectedSeats.length === 0) {
      alert('Mohon lengkapi semua data');
      return;
    }
    
    alert('Pembayaran berhasil! Tiket telah dicetak.');
    
    setSelectedMovie(null);
    setSelectedSchedule(null);
    setSeats([]);
    setSelectedSeats([]);
    setCustomerInfo({ name: '', phone: '' });
    setTotal(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Kasir Bioskop</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Pilih Film</h2>
            <div className="space-y-3">
              {movies.map(movie => (
                <button
                  key={movie.id}
                  onClick={() => handleMovieSelect(movie)}
                  className={`w-full p-3 text-left rounded-lg border ${
                    selectedMovie?.id === movie.id 
                      ? 'bg-blue-100 border-blue-500' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{movie.title}</div>
                  <div className="text-sm text-gray-600">Rp {movie.price.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Pilih Jadwal</h2>
            {selectedMovie ? (
              <div className="space-y-3">
                {schedules.map(schedule => (
                  <button
                    key={schedule.id}
                    onClick={() => handleScheduleSelect(schedule)}
                    className={`w-full p-3 text-left rounded-lg border ${
                      selectedSchedule?.id === schedule.id 
                        ? 'bg-green-100 border-green-500' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{schedule.time}</div>
                    <div className="text-sm text-gray-600">{schedule.studio}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Pilih film terlebih dahulu</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Data Pelanggan</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nama Pelanggan"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="No. Telepon"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              
              {selectedSeats.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Kursi Dipilih:</div>
                  <div className="font-medium">{selectedSeats.join(', ')}</div>
                  <div className="text-lg font-bold text-blue-600 mt-2">
                    Total: Rp {total.toLocaleString()}
                  </div>
                </div>
              )}
              
              <button
                onClick={handlePayment}
                disabled={!customerInfo.name || !customerInfo.phone || selectedSeats.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                Bayar & Cetak Tiket
              </button>
            </div>
          </div>
        </div>

        {selectedSchedule && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Pilih Kursi</h2>
            <div className="mb-4 text-center">
              <div className="bg-gray-800 text-white py-2 px-8 rounded-lg inline-block">LAYAR</div>
            </div>
            <div className="grid grid-cols-10 gap-2 max-w-md mx-auto">
              {seats.map(seat => (
                <button
                  key={seat.id}
                  onClick={() => seat.available && toggleSeat(seat.id)}
                  disabled={!seat.available}
                  className={`w-8 h-8 text-xs font-medium rounded ${
                    !seat.available 
                      ? 'bg-red-300 cursor-not-allowed' 
                      : selectedSeats.includes(seat.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-green-200 hover:bg-green-300'
                  }`}
                >
                  {seat.id}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span>Tersedia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Dipilih</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-300 rounded"></div>
                <span>Terisi</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierDashboard;