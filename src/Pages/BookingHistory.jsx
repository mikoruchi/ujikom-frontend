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
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
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
        return 'Dipesan';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  // Check if ticket is upcoming (for today or future)
  const isUpcoming = (ticket) => {
    if (ticket.status !== 'booked') return false;
    
    const showDate = new Date(ticket.jadwal?.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return showDate >= today;
  };

  // Check if ticket can be cancelled (only booked tickets for future shows)
  const canCancel = (ticket) => {
    if (ticket.status !== 'booked') return false;
    
    const showDate = new Date(ticket.jadwal?.date);
    const today = new Date();
    
    // Can cancel if show is at least 2 hours from now
    const showDateTime = new Date(`${ticket.jadwal?.date}T${ticket.jadwal?.time}`);
    const timeDiff = showDateTime - today;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff > 2;
  };

  // View ticket details
  const handleViewTicket = (ticket) => {
    navigate('/ticket-detail', { state: { ticket } });
  };

  // Download invoice (placeholder function)
  const handleDownloadInvoice = (ticket) => {
    alert('Fitur download invoice akan segera tersedia!');
    console.log('Download invoice for:', ticket);
  };

  // Give rating (placeholder function)
  const handleGiveRating = (ticket) => {
    alert('Fitur rating akan segera tersedia!');
    console.log('Give rating for:', ticket);
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
      <div className="max-w-4xl mx-auto px-4">
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
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">
                        {ticket.jadwal?.movie?.title || 'Unknown Movie'}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${getStatusColor(ticket.status)}`}>
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
                          <span className="text-white">{ticket.jadwal?.date ? formatDate(ticket.jadwal.date) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Jam Tayang:</span>
                          <span className="text-white">{ticket.jadwal?.time ? formatTime(ticket.jadwal.time) : 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Studio:</span>
                          <span className="text-white">{ticket.studio?.studio || 'N/A'}</span>
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
                          onClick={() => handleViewTicket(ticket)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                        >
                          Lihat Tiket
                        </button>
                        {canCancel(ticket) && (
                          <button 
                            onClick={() => handleCancelTicket(ticket.id)}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold"
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
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                        >
                          Lihat Tiket
                        </button>
                        <button 
                          onClick={() => handleDownloadInvoice(ticket)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                        >
                          Download Invoice
                        </button>
                        <button 
                          onClick={() => handleGiveRating(ticket)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-lg text-sm font-semibold"
                        >
                          Beri Rating
                        </button>
                      </>
                    )}
                    
                    {/* Actions for cancelled tickets */}
                    {ticket.status === 'cancelled' && (
                      <button 
                        disabled
                        className="bg-gray-500 text-white py-2 px-4 rounded-lg text-sm font-semibold cursor-not-allowed"
                      >
                        Dibatalkan
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    Dipesan pada: {ticket.created_at ? formatDate(ticket.created_at) : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info tentang status tiket */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-3">Informasi Status Tiket:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Dipesan - Menunggu pembayaran</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Selesai - Tiket aktif</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-300">Dibatalkan - Tiket tidak valid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;