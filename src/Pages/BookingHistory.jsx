import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const navigate = useNavigate();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Create API instance with interceptor
  const createApiInstance = () => {
    const token = getAuthToken();
    
    const api = axios.create({
      baseURL: 'http://localhost:8000/api/v1',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add response interceptor for handling 401 errors
    api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          navigate('/login', { state: { from: '/booking-history' } });
        }
        return Promise.reject(error);
      }
    );

    return api;
  };

  // Verify authentication and get user info
  const verifyAuth = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const api = createApiInstance();
      const response = await api.get('/user');
      
      if (response.data.success) {
        setUser(response.data.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('❌ Auth verification failed:', err);
      return false;
    }
  };

  // Fetch user tickets from API
  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify authentication first
      const isAuthenticated = await verifyAuth();
      if (!isAuthenticated) {
        setError('Anda harus login terlebih dahulu');
        navigate('/login', { state: { from: '/booking-history' } });
        return;
      }

      const api = createApiInstance();
      const response = await api.get('/payments/history');

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

  // View Invoice
  const handleViewInvoice = async (ticket) => {
    try {
      const api = createApiInstance();
      const response = await api.get(`/payments/${ticket.id}/invoice`);
      
      if (response.data.success) {
        setSelectedInvoice(response.data.data);
        setShowInvoiceModal(true);
      } else {
        throw new Error(response.data.message || 'Gagal memuat invoice');
      }
    } catch (err) {
      console.error('❌ Error fetching invoice:', err);
      alert('Gagal memuat invoice: ' + (err.response?.data?.message || err.message));
    }
  };

  // Download Invoice PDF
  const handleDownloadInvoice = async (ticket) => {
    try {
      // Create PDF content
      const invoiceContent = generateInvoiceContent(ticket);
      
      // Create blob and download
      const blob = new Blob([invoiceContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${getBookingCode(ticket)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('❌ Error downloading invoice:', err);
      alert('Gagal mengunduh invoice: ' + (err.response?.data?.message || err.message));
    }
  };

  // Generate invoice content for PDF
  const generateInvoiceContent = (ticket) => {
    const bookingCode = getBookingCode(ticket);
    
    // Simple HTML content for PDF
    return `
      <html>
        <head>
          <title>Invoice ${bookingCode}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-size: 18px; font-weight: bold; color: #059669; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎬 BIOSKOP CINEMA</h1>
            <h2>INVOICE</h2>
          </div>
          
          <div class="section">
            <h3>Informasi Pemesanan</h3>
            <div class="row">
              <span>Booking ID:</span>
              <span><strong>${bookingCode}</strong></span>
            </div>
            <div class="row">
              <span>Film:</span>
              <span>${ticket.jadwal?.film?.title || 'Film Tidak Diketahui'}</span>
            </div>
            <div class="row">
              <span>Tanggal Tayang:</span>
              <span>${formatDate(ticket.jadwal?.show_date)}</span>
            </div>
            <div class="row">
              <span>Jam Tayang:</span>
              <span>${formatTime(ticket.jadwal?.show_time)}</span>
            </div>
            <div class="row">
              <span>Studio:</span>
              <span>${ticket.jadwal?.studio?.studio || 'N/A'}</span>
            </div>
            <div class="row">
              <span>Kursi:</span>
              <span>${formatSeats(ticket.kursi)}</span>
            </div>
          </div>

          <div class="section">
            <h3>Detail Pembayaran</h3>
            <div class="row">
              <span>Subtotal:</span>
              <span>Rp ${formatPrice(ticket.subtotal)}</span>
            </div>
            <div class="row">
              <span>Biaya Admin:</span>
              <span>Rp ${formatPrice(ticket.admin_fee || 0)}</span>
            </div>
            <div class="row total">
              <span>Total:</span>
              <span>Rp ${formatPrice(ticket.total_amount)}</span>
            </div>
            <div class="row">
              <span>Metode Bayar:</span>
              <span>${ticket.method?.toUpperCase() || 'N/A'}</span>
            </div>
            <div class="row">
              <span>Status:</span>
              <span>${getStatusText(ticket.status)}</span>
            </div>
          </div>

          <div class="section">
            <p><strong>Dipesan pada:</strong> ${ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('id-ID') : 'N/A'}</p>
          </div>
        </body>
      </html>
    `;
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
      const timeParts = timeString.split(':');
      return `${timeParts[0]}:${timeParts[1]}`;
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
      case 'success':
        return 'bg-green-500';
      case 'pending':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status text in Indonesian
  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Berhasil';
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'failed':
        return 'Gagal';
      default:
        return status;
    }
  };

  // Format kursi array to string
  const formatSeats = (seats) => {
    if (!seats) return 'N/A';
    
    try {
      if (typeof seats === 'string') {
        const parsedSeats = JSON.parse(seats);
        if (Array.isArray(parsedSeats)) {
          return parsedSeats.join(', ');
        }
      }
      
      if (Array.isArray(seats)) {
        return seats.join(', ');
      }
      
      return seats;
    } catch (error) {
      return seats || 'N/A';
    }
  };

  // Generate booking code
  const getBookingCode = (ticket) => {
    return ticket.booking_code || `PAY${ticket.id.toString().padStart(6, '0')}`;
  };

  useEffect(() => {
    fetchUserTickets();
  }, []);

  // Invoice Modal Component
  const InvoiceModal = () => {
    if (!showInvoiceModal || !selectedInvoice) return null;

    const invoice = selectedInvoice;
    const bookingCode = getBookingCode(invoice);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Invoice Content */}
            <div className="border-2 border-gray-300 rounded-lg p-6">
              {/* Film Info */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {invoice.jadwal?.film?.title || 'Film Tidak Diketahui'}
                </h3>
                <p className="text-gray-600">Studio Bioskop</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-semibold text-blue-600">{bookingCode}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tanggal Tayang:</span>
                    <span>{formatDate(invoice.jadwal?.show_date)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Jam Tayang:</span>
                    <span>{formatTime(invoice.jadwal?.show_time)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Studio:</span>
                    <span>{invoice.jadwal?.studio?.studio || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Kursi:</span>
                    <span className="font-semibold">{formatSeats(invoice.kursi)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Total Harga:</span>
                    <span className="font-semibold text-green-600">
                      Rp {formatPrice(invoice.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-4 text-xs text-gray-600">
                <div className="mb-2">
                  <span>Dipesan pada: </span>
                  <span className="font-semibold">
                    {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </span>
                </div>
                <div className="mb-2">
                  <span>Jumlah Tiket: </span>
                  <span className="font-semibold">{invoice.ticket_count || 1}</span>
                </div>
                {invoice.method && (
                  <div className="mb-2">
                    <span>Metode Bayar: </span>
                    <span className="font-semibold">{invoice.method.toUpperCase()}</span>
                  </div>
                )}
                {invoice.admin_fee > 0 && (
                  <div className="mb-2">
                    <span>Biaya Admin: </span>
                    <span className="font-semibold">Rp {formatPrice(invoice.admin_fee)}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(invoice.status)}`}>
                    {getStatusText(invoice.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleDownloadInvoice(invoice)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Coba Lagi
            </button>
            <Link
              to="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
          </div>
          <Link
            to="/"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
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
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Pesan Tiket Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(ticket => (
              <div key={ticket.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    <img
                      src={ticket.jadwal?.film?.poster || '/api/placeholder/80/112'}
                      alt={ticket.jadwal?.film?.title}
                      className="w-20 h-28 object-cover rounded-lg shadow-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTEyIiB2aWV3Qm94PSIwIDAgODAgMTEyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4MCIgaGVpZ2h0PSIxMTIiIGZpbGw9IiMzQTRBNTciLz48dGV4dCB4PSI0MCIgeT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3RTg4OEQiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>

                  {/* Ticket Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-xl font-semibold text-white">
                        {ticket.jadwal?.film?.title || 'Film Tidak Diketahui'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Booking ID:</span>
                          <span className="text-white font-mono">{getBookingCode(ticket)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tanggal Tayang:</span>
                          <span className="text-white">{formatDate(ticket.jadwal?.show_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Jam Tayang:</span>
                          <span className="text-white">{formatTime(ticket.jadwal?.show_time)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Studio:</span>
                          <span className="text-white">{ticket.jadwal?.studio?.studio || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Kursi:</span>
                          <span className="text-white font-semibold">{formatSeats(ticket.kursi)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Harga:</span>
                          <span className="text-yellow-400 font-semibold">
                            Rp {formatPrice(ticket.total_amount || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                      <div>
                        <span>Dipesan pada: </span>
                        <span className="text-gray-300">
                          {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span>Jumlah Tiket: </span>
                        <span className="text-green-400 font-semibold">{ticket.ticket_count || 1}</span>
                      </div>
                      {ticket.method && (
                        <div>
                          <span>Metode Bayar: </span>
                          <span className="text-blue-400">{ticket.method.toUpperCase()}</span>
                        </div>
                      )}
                      {ticket.admin_fee > 0 && (
                        <div>
                          <span>Biaya Admin: </span>
                          <span className="text-orange-400">Rp {formatPrice(ticket.admin_fee)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <button 
                      onClick={() => handleViewInvoice(ticket)}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                    >
                      📋 Lihat Invoice
                    </button>

                    <button 
                      onClick={() => handleDownloadInvoice(ticket)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                    >
                      📄 Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal />
    </div>
  );
};

export default BookingHistory;