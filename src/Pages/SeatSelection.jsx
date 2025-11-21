import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const SeatSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { movie, schedule } = location.state || {};

  useEffect(() => {
    console.log('Movie:', movie);
    console.log('Schedule:', schedule);
  }, []); // hanya sekali saat mount
  
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studio, setStudio] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Create axios instance with auth
  const createApiInstance = () => {
    const token = getAuthToken();
    
    const instance = axios.create({
      baseURL: 'http://localhost:8000/api/v1',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return instance;
  };

  // Format number dengan titik untuk ribuan
  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return new Intl.NumberFormat('id-ID').format(numPrice);
  };

  // APPROACH 1: Coba endpoint yang berbeda untuk booked seats
  const fetchBookedSeats = async () => {
    try {
      if (!schedule?.id) {
        console.warn('Schedule ID tidak tersedia');
        return;
      }

      const api = createApiInstance();
      console.log('🔄 Fetching booked seats for schedule:', schedule.id);
      
      // Coba beberapa endpoint yang mungkin
      let response;
      
      try {
        // Approach 1: Endpoint khusus untuk booked seats
        response = await api.get(`/bookings/schedule/${schedule.id}/seats`);
      } catch (err) {
        console.log('❌ Approach 1 failed, trying approach 2...');
        
        // Approach 2: Endpoint bookings biasa lalu filter
        response = await api.get(`/bookings`);
        const allBookings = response.data.data || [];
        
        // Filter bookings untuk schedule ini dan status confirmed/paid
        const scheduleBookings = allBookings.filter(booking => 
          booking.schedule_id === schedule.id && 
          (booking.status === 'confirmed' || booking.status === 'paid' || booking.status === 'completed')
        );
        
        const bookedSeatIds = [];
        scheduleBookings.forEach(booking => {
          if (booking.seats && Array.isArray(booking.seats)) {
            booking.seats.forEach(seat => {
              if (seat.seat_id) {
                bookedSeatIds.push(seat.seat_id);
              }
              // Juga coba dengan kursi_no jika seat_id tidak ada
              if (seat.kursi_no) {
                // Cari seat_id berdasarkan kursi_no
                const seatObj = seats.find(s => s.kursi_no === seat.kursi_no);
                if (seatObj) {
                  bookedSeatIds.push(seatObj.id);
                }
              }
            });
          }
        });
        
        setBookedSeats([...new Set(bookedSeatIds)]); // Remove duplicates
        console.log(`✅ Loaded ${bookedSeatIds.length} booked seats from approach 2`);
        return;
      }

      // Jika approach 1 berhasil
      if (response.data.success) {
        const bookedSeatsData = response.data.data || [];
        const bookedSeatIds = bookedSeatsData.map(seat => seat.seat_id || seat.id);
        setBookedSeats(bookedSeatIds);
        console.log(`✅ Loaded ${bookedSeatIds.length} booked seats from approach 1`);
      }
      
    } catch (err) {
      console.error('❌ Error fetching booked seats:', err);
      
      // APPROACH 3: Fallback - coba dari local storage atau state management
      try {
        const localBookings = JSON.parse(localStorage.getItem('recentBookings') || '[]');
        const scheduleBookings = localBookings.filter(booking => 
          booking.scheduleId === schedule.id
        );
        
        const bookedSeatIds = [];
        scheduleBookings.forEach(booking => {
          if (booking.seats) {
            booking.seats.forEach(seat => {
              if (seat.id) bookedSeatIds.push(seat.id);
            });
          }
        });
        
        setBookedSeats([...new Set(bookedSeatIds)]);
        console.log(`✅ Loaded ${bookedSeatIds.length} booked seats from local storage`);
      } catch (localErr) {
        console.log('❌ All approaches failed, no booked seats data');
      }
    }
  };

  // APPROACH ALTERNATIF: Gunakan endpoint seats dengan filter status
  const fetchSeatsWithStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!schedule?.studio_id) {
        throw new Error('Studio ID tidak tersedia');
      }

      const api = createApiInstance();
      console.log('🔄 Fetching seats with status for studio:', schedule.studio_id);
      
      // Coba endpoint yang memberikan status booking
      const response = await api.get(`/seats/studio/${schedule.studio_id}?schedule_id=${schedule.id}`);
      
      console.log('✅ Seats with status response:', response.data);

      if (response.data.success) {
        const seatsData = response.data.data.seats || [];
        const studioData = response.data.data.studio;
        
        setSeats(seatsData);
        setStudio(studioData);
        
        // Extract booked seats dari response jika ada
        const bookedSeatIds = seatsData
          .filter(seat => seat.is_booked || seat.status === 'booked')
          .map(seat => seat.id);
        
        if (bookedSeatIds.length > 0) {
          setBookedSeats(bookedSeatIds);
          console.log(`✅ Found ${bookedSeatIds.length} booked seats from seats API`);
        }
        
        console.log(`✅ Loaded ${seatsData.length} seats`);
      } else {
        throw new Error(response.data.message || 'Gagal memuat data kursi');
      }
    } catch (err) {
      console.error('❌ Error fetching seats with status:', err);
      
      // Fallback ke endpoint biasa
      await fetchSeatsBasic();
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Fetch seats basic tanpa status booking
  const fetchSeatsBasic = async () => {
    try {
      const api = createApiInstance();
      const response = await api.get(`/seats/studio/${schedule.studio_id}`);
      
      if (response.data.success) {
        setSeats(response.data.data.seats || []);
        setStudio(response.data.data.studio);
      }
    } catch (err) {
      setError('Gagal memuat data kursi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Cek apakah kursi sudah dipesan
  const isSeatBooked = (seatId) => {
    return bookedSeats.includes(seatId);
  };

  // Group seats by row
  const groupSeatsByRow = () => {
    const grouped = {};
    seats.forEach(seat => {
      const row = seat.kursi_no.charAt(0);
      if (!grouped[row]) {
        grouped[row] = [];
      }
      grouped[row].push(seat);
    });

    Object.keys(grouped).forEach(row => {
      grouped[row].sort((a, b) => {
        const numA = parseInt(a.kursi_no.slice(1));
        const numB = parseInt(b.kursi_no.slice(1));
        return numA - numB;
      });
    });

    return grouped;
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'maintenance' || isSeatBooked(seat.id)) {
      return;
    }

    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const getSeatColor = (seat) => {
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    
    if (isSeatBooked(seat.id)) {
      return 'bg-gray-600 cursor-not-allowed border-2 border-gray-500 opacity-75';
    }
    
    if (seat.status === 'maintenance') {
      return 'bg-red-500 hover:bg-red-600 cursor-not-allowed opacity-75';
    }
    
    if (isSelected) {
      return 'bg-yellow-500 hover:bg-yellow-600 text-black transform scale-110';
    }
    
    if (seat.status === 'vip') {
      return 'bg-purple-500 hover:bg-purple-600';
    }
    
    return 'bg-green-500 hover:bg-green-600';
  };

  const getSeatTitle = (seat) => {
    if (isSeatBooked(seat.id)) {
      return `${seat.kursi_no} - ❌ SUDAH DIPESAN (Tidak tersedia)`;
    }
    
    if (seat.status === 'maintenance') {
      return `${seat.kursi_no} - 🔧 DALAM PERBAIKAN`;
    }
    
    const price = getSeatPrice(seat);
    const type = seat.status === 'vip' ? 'VIP' : 'Regular';
    return `${seat.kursi_no} - ${type} - Rp ${formatPrice(price)} - ✅ TERSEDIA`;
  };

  const getSeatPrice = (seat) => {
    const basePrice = Number(schedule?.price) || 50000;
    return seat.status === 'vip' ? basePrice + 20000 : basePrice;
  };

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0);
  };

  const calculatePriceBreakdown = () => {
    const regularSeats = selectedSeats.filter(seat => seat.status !== 'vip');
    const vipSeats = selectedSeats.filter(seat => seat.status === 'vip');
    const basePrice = Number(schedule?.price) || 50000;
    
    return {
      regular: {
        count: regularSeats.length,
        price: basePrice,
        total: regularSeats.length * basePrice
      },
      vip: {
        count: vipSeats.length,
        price: basePrice + 20000,
        total: vipSeats.length * (basePrice + 20000)
      },
      grandTotal: calculateTotalPrice()
    };
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Pilih minimal 1 kursi');
      return;
    }
    
navigate('/payment', {
  state: {
    movie: movie,
    schedule: {
      ...schedule,
      jadwal_id: schedule.schedule_id || schedule.id || schedule.jadwal_id
    },
    seats: selectedSeats,
    totalPrice: selectedSeats.length * schedule.price
  }
});





  };

  // DEBUG: Log data untuk troubleshooting
  useEffect(() => {
    console.log('🎯 Schedule data:', schedule);
    console.log('🎯 Booked seats:', bookedSeats);
    console.log('🎯 All seats:', seats);
  }, [schedule, bookedSeats, seats]);

  useEffect(() => {
    if (schedule?.studio_id) {
      const loadData = async () => {
        await fetchSeatsWithStatus();
        // Tunggu sebentar lalu fetch booked seats terpisah
        setTimeout(() => {
          fetchBookedSeats();
        }, 1000);
      };
      loadData();
    } else {
      setError('Data jadwal tidak lengkap');
      setLoading(false);
    }
  }, [schedule]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">Memuat data kursi...</p>
          <p className="text-gray-400 text-sm mt-2">Memeriksa ketersediaan kursi</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }

  const groupedSeats = groupSeatsByRow();
  const rows = Object.keys(groupedSeats).sort();
  const priceBreakdown = calculatePriceBreakdown();
  const totalPrice = calculateTotalPrice();

  const availableSeats = seats.filter(seat => 
    seat.status !== 'maintenance' && !isSeatBooked(seat.id)
  ).length;
  const bookedSeatsCount = bookedSeats.length;
  const maintenanceSeats = seats.filter(seat => seat.status === 'maintenance').length;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Pilih Kursi</h1>
          <p className="text-gray-400 text-lg">
            {movie?.title} - {schedule?.time} - {studio?.studio}
          </p>
          <p className="text-gray-500 text-sm">
            {schedule?.date} • Schedule ID: {schedule?.id} • Studio ID: {schedule?.studio_id}
          </p>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-yellow-400 font-semibold mb-2">Status Kursi:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total: </span>
              <span className="text-white">{seats.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Tersedia: </span>
              <span className="text-green-400 font-semibold">{availableSeats}</span>
            </div>
            <div>
              <span className="text-gray-400">Sudah Dipesan: </span>
              <span className="text-red-400 font-semibold">{bookedSeatsCount}</span>
            </div>
            <div>
              <span className="text-gray-400">Maintenance: </span>
              <span className="text-orange-400">{maintenanceSeats}</span>
            </div>
            <div>
              <span className="text-gray-400">Kursi Dipilih: </span>
              <span className="text-yellow-400 font-semibold">{selectedSeats.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Harga Regular: </span>
              <span className="text-green-400">Rp {formatPrice(schedule?.price || 50000)}</span>
            </div>
            <div>
              <span className="text-gray-400">Harga VIP: </span>
              <span className="text-purple-400">Rp {formatPrice((Number(schedule?.price) || 50000) + 20000)}</span>
            </div>
            <div>
              <span className="text-gray-400">Total: </span>
              <span className="text-yellow-400 font-semibold">Rp {formatPrice(totalPrice)}</span>
            </div>
          </div>
          {/* Debug info */}
          <div className="mt-3 p-2 bg-gray-700 rounded text-xs">
            <div>Schedule ID: <span className="text-yellow-400">{schedule?.id || 'Tidak tersedia'}</span></div>
            <div>Studio ID: <span className="text-yellow-400">{schedule?.studio_id || 'Tidak tersedia'}</span></div>
            <div>Booked Seats Count: <span className="text-yellow-400">{bookedSeats.length}</span></div>
          </div>
        </div>

        {/* Screen */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-4 px-12 rounded-t-3xl inline-block font-semibold text-lg">
            LAYAR
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="space-y-2 max-w-4xl mx-auto">
            {rows.map(row => (
              <div key={row} className="flex justify-center gap-1">
                <div className="w-8 flex items-center justify-center text-white font-semibold">
                  {row}
                </div>
                {groupedSeats[row].map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.status === 'maintenance' || isSeatBooked(seat.id)}
                    className={`
                      w-8 h-8 rounded text-xs font-semibold transition-all duration-200
                      ${getSeatColor(seat)}
                    `}
                    title={getSeatTitle(seat)}
                  >
                    {seat.kursi_no.slice(1)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-300 text-sm">Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-gray-300 text-sm">VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-300 text-sm">Dipilih</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded border border-gray-500"></div>
            <span className="text-gray-300 text-sm">Sudah Dipesan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-300 text-sm">Maintenance</span>
          </div>
        </div>

        {/* Rest of the component remains the same */}
        {/* ... (summary, action buttons, additional info) */}
        
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-white font-semibold mb-3">Kursi Dipilih:</h3>
              {selectedSeats.length > 0 ? (
                <div className="space-y-2">
                  {selectedSeats.map(seat => (
                    <div key={seat.id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-400 font-semibold">{seat.kursi_no}</span>
                        {seat.status === 'vip' && (
                          <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">VIP</span>
                        )}
                      </div>
                      <span className="text-white font-semibold">
                        Rp {formatPrice(getSeatPrice(seat))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">Belum ada kursi dipilih</p>
              )}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">Ringkasan Pembayaran</h3>
              <div className="space-y-3">
                {priceBreakdown.regular.count > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-300">Regular ({priceBreakdown.regular.count}x)</span>
                      <div className="text-xs text-gray-400">Rp {formatPrice(priceBreakdown.regular.price)} per tiket</div>
                    </div>
                    <span className="text-green-400 font-semibold">
                      Rp {formatPrice(priceBreakdown.regular.total)}
                    </span>
                  </div>
                )}
                
                {priceBreakdown.vip.count > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-300">VIP ({priceBreakdown.vip.count}x)</span>
                      <div className="text-xs text-gray-400">Rp {formatPrice(priceBreakdown.vip.price)} per tiket</div>
                    </div>
                    <span className="text-purple-400 font-semibold">
                      Rp {formatPrice(priceBreakdown.vip.total)}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-600 pt-3 mt-2">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-300 font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      Rp {formatPrice(priceBreakdown.grandTotal)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {selectedSeats.length} tiket
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={handleContinue}
              disabled={selectedSeats.length === 0}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-3 rounded-lg font-semibold transition-colors"
            >
              Lanjut ke Pembayaran (Rp {formatPrice(totalPrice)})
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">Informasi Penting:</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• <span className="text-green-400">Kursi hijau</span> = Tersedia untuk dipesan</li>
            <li>• <span className="text-purple-400">Kursi ungu</span> = VIP (+Rp 20.000)</li>
            <li>• <span className="text-yellow-400">Kursi kuning</span> = Sudah Anda pilih</li>
            <li>• <span className="text-gray-400">Kursi abu-abu</span> = Sudah dipesan orang lain</li>
            <li>• <span className="text-red-400">Kursi merah</span> = Sedang maintenance</li>
            <li>• Hover pada kursi untuk melihat detail informasi</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;