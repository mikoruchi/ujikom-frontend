import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Create API instance
  const createApiInstance = () => {
    const token = getAuthToken();
    
    return axios.create({
      baseURL: 'http://localhost:8000/api/v1',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  };

  // Fetch user tickets from API
  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('Anda harus login terlebih dahulu');
        navigate('/login', { state: { from: '/booking-history' } });
        return;
      }

      const api = createApiInstance();
      const response = await api.get('/tickets');

      console.log('📦 Tickets response:', response.data);

      if (response.data.success) {
        const tickets = response.data.data || [];
        setBookings(tickets);
      } else {
        throw new Error(response.data.message || 'Gagal memuat data tiket');
      }
    } catch (err) {
      console.error('❌ Error fetching tickets:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memuat riwayat pemesanan';
      setError(errorMessage);

      if (err.response?.status === 401) {
        navigate('/login', { state: { from: '/booking-history' } });
      }
    } finally {
      setLoading(false);
    }
  };

  // Cancel ticket
  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan tiket ini?')) {
      return;
    }

    try {
      const api = createApiInstance();
      const response = await api.delete(`/tickets/${ticketId}/cancel`);

      if (response.data.success) {
        alert('Tiket berhasil dibatalkan');
        // Refresh data
        fetchUserTickets();
      } else {
        throw new Error(response.data.message || 'Gagal membatalkan tiket');
      }
    } catch (err) {
      console.error('❌ Error cancelling ticket:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Gagal membatalkan tiket';
      alert(`Error: ${errorMessage}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
  };

  // Format price
  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return new Intl.NumberFormat('id-ID').format(numPrice);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'completed': 
        return 'bg-green-500';
      case 'booked':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status text in Indonesian
  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'Selesai';
      case 'booked':
        return 'Menunggu Pembayaran';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  // Check if ticket is upcoming (for today or future)
  const isUpcoming = (ticket) => {
    if (ticket.status !== 'booked' && ticket.status !== 'paid') return false;
    if (!ticket.jadwal?.date || !ticket.jadwal?.time) return false;
    
    try {
      const showDate = new Date(ticket.jadwal.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return showDate >= today;
    } catch (error) {
      return false;
    }
  };

  // Check if ticket can be cancelled (only booked tickets for future shows)
  const canCancel = (ticket) => {
    if (ticket.status !== 'booked') return false;
    if (!ticket.jadwal?.date || !ticket.jadwal?.time) return false;
    
    try {
      const showDateTime = new Date(`${ticket.jadwal.date}T${ticket.jadwal.time}`);
      const today = new Date();
      const timeDiff = showDateTime - today;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      return hoursDiff > 2;
    } catch (error) {
      return false;
    }
  };

  // View ticket details
  const handleViewTicket = (ticket) => {
    navigate('/ticket-detail', { state: { ticket } });
  };

  // Download invoice
  const handleDownloadInvoice = (ticket) => {
    // Implementasi download invoice berdasarkan data dari API
    if (ticket.invoice_url) {
      window.open(ticket.invoice_url, '_blank');
    } else {
      alert('Invoice belum tersedia untuk diunduh');
    }
  };

  // Give rating
  const handleGiveRating = (ticket) => {
    navigate('/rating', { state: { ticket } });
  };

  // Retry payment for booked tickets
  const handleRetryPayment = (ticket) => {
    navigate('/payment', { 
      state: { 
        bookingId: ticket.id,
        totalPrice: ticket.jadwal?.price 
      } 
    });
  };

  useEffect(() => {
    fetchUserTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">Memuat riwayat pemesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchUserTickets}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
            >
              Coba Lagi
            </button>
            <Link
              to="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Kembali ke Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Riwayat Pemesanan</h1>
            <p className="text-gray-400">Lihat semua tiket yang pernah Anda pesan</p>
            <p className="text-gray-500 text-sm mt-1">
              Total: {bookings.length} tiket
            </p>
          </div>
          <Link
            to="/"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold"
          >
            ← Kembali
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Pemesanan</h3>
            <p className="text-gray-400 mb-6">Anda belum pernah memesan tiket</p>
            <Link
              to="/films"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
            >
              Pesan Tiket Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(ticket => (
              <div key={ticket.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    <img
                      src={ticket.jadwal?.movie?.poster || '/api/placeholder/80/112'}
                      alt={ticket.jadwal?.movie?.title}
                      className="w-20 h-28 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTEyIiB2aWV3Qm94PSIwIDAgODAgMTEyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4MCIgaGVpZ2h0PSIxMTIiIGZpbGw9IiMzQTRBNTciLz48dGV4dCB4PSI0MCIgeT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3RTg4OEQiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">
                        {ticket.jadwal?.movie?.title || 'Film Tidak Diketahui'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                        {isUpcoming(ticket) && ' • Akan Datang'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Booking ID:</span>
                          <span className="text-white font-mono">TKT{ticket.id.toString().padStart(6, '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tanggal Tayang:</span>
                          <span className="text-white">{formatDate(ticket.jadwal?.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Jam Tayang:</span>
                          <span className="text-white">{formatTime(ticket.jadwal?.time)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Studio:</span>
                          <span className="text-white">{ticket.studio?.studio || ticket.jadwal?.studio?.studio || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Kursi:</span>
                          <span className="text-white">{ticket.kursi?.kursi_no || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Harga:</span>
                          <span className="text-yellow-400 font-semibold">
                            Rp {formatPrice(ticket.jadwal?.price || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                      <div>
                        <span>Dipesan pada: </span>
                        <span className="text-gray-300">
                          {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('id-ID') : 'N/A'}
                        </span>
                      </div>
                      {ticket.booking_code && (
                        <div>
                          <span>Kode Booking: </span>
                          <span className="text-green-400 font-mono">{ticket.booking_code}</span>
                        </div>
                      )}
                    </div>

                    {/* QR Code Info */}
                    {ticket.qr_code && (
                      <div className="mt-3 p-3 bg-gray-700 rounded text-xs">
                        <span className="text-gray-400">QR Code: </span>
                        <span className="text-green-400">Tersedia</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 lg:w-48">
                    {/* Actions for booked tickets */}
                    {ticket.status === 'booked' && (
                      <>
                        <button 
                          onClick={() => handleRetryPayment(ticket)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Bayar Sekarang
                        </button>
                        <button 
                          onClick={() => handleViewTicket(ticket)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Detail Pemesanan
                        </button>
                        {canCancel(ticket) && (
                          <button 
                            onClick={() => handleCancelTicket(ticket.id)}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Batalkan
                          </button>
                        )}
                        {!canCancel(ticket) && (
                          <button 
                            disabled
                            className="bg-gray-500 text-white py-2 px-4 rounded-lg text-sm font-semibold cursor-not-allowed opacity-50"
                            title="Tidak dapat dibatalkan (kurang dari 2 jam sebelum tayang)"
                          >
                            Tidak Dapat Dibatalkan
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Actions for paid/completed tickets */}
                    {(ticket.status === 'paid' || ticket.status === 'completed') && (
                      <>
                        <button 
                          onClick={() => handleViewTicket(ticket)}
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Lihat Tiket
                        </button>
                        <button 
                          onClick={() => handleDownloadInvoice(ticket)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Download Invoice
                        </button>
                        {isUpcoming(ticket) && (
                          <button 
                            onClick={() => handleCancelTicket(ticket.id)}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Batalkan
                          </button>
                        )}
                        <button 
                          onClick={() => handleGiveRating(ticket)}
                          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Beri Rating
                        </button>
                      </>
                    )}
                    
                    {/* Actions for cancelled tickets */}
                    {ticket.status === 'cancelled' && (
                      <button 
                        onClick={() => handleViewTicket(ticket)}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Lihat Detail
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info tentang status tiket */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-yellow-400 font-semibold mb-4">Informasi Status Tiket:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <div className="text-white font-semibold">Menunggu Pembayaran</div>
                <div className="text-gray-400 text-xs">Selesaikan pembayaran dalam 15 menit</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-white font-semibold">Selesai</div>
                <div className="text-gray-400 text-xs">Pembayaran berhasil, tiket aktif</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <div className="text-white font-semibold">Dibatalkan</div>
                <div className="text-gray-400 text-xs">Pemesanan dibatalkan</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <div>
                <div className="text-white font-semibold">Kadaluarsa</div>
                <div className="text-gray-400 text-xs">Pembayaran tidak diselesaikan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;