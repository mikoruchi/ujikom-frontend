import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Eye, Printer, XCircle,
  ShoppingCart, DollarSign, CreditCard, TrendingUp,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';

const CashierDataTransaksi = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    totalTickets: 0,
    successRate: 0
  });

  // Sesuaikan dengan URL Laravel Anda
  const API_BASE = 'http://127.0.0.1:8000/api/v1';

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
    calculateStats();
  }, [transactions, searchTerm, filterStatus, filterDate]);

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔄 Loading transactions from API...');
      
      // Coba beberapa endpoint yang mungkin
      const endpoints = [
        '/payments',
      ];

      let response = null;
      let result = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          });

          if (response.ok) {
            result = await response.json();
            console.log(`✅ Success with endpoint: ${endpoint}`, result);
            break;
          }
        } catch (e) {
          console.log(`Endpoint ${endpoint} failed:`, e.message);
          continue;
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Tidak dapat terhubung ke server. Pastikan server Laravel berjalan di ${API_BASE}`);
      }

      if (result && result.success) {
        setTransactions(result.data || []);
        console.log(`✅ Loaded ${result.data.length} transactions from database`);
      } else {
        throw new Error(result?.message || 'Format response tidak valid');
      }

    } catch (error) {
      console.error('❌ Error loading transactions:', error);
      setError(error.message);
      // TIDAK ADA FALLBACK DATA - biarkan kosong jika error
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsPrinted = async (transactionId) => {
    try {
      const response = await fetch(`${API_BASE}/payments/${transactionId}/mark-printed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTransactions(prev => prev.map(t => 
            t.id === transactionId ? { ...t, is_printed: true } : t
          ));
          alert('✅ Tiket berhasil ditandai sebagai tercetak');
        }
      } else {
        throw new Error('Gagal menandai tiket sebagai tercetak');
      }
    } catch (error) {
      console.error('Error marking as printed:', error);
      alert('❌ Gagal menandai tiket: ' + error.message);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.movie_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Filter by date
    const today = new Date().toISOString().split('T')[0];
    if (filterDate === 'today') {
      filtered = filtered.filter(t => {
        const transactionDate = t.created_at?.split(' ')[0] || t.show_date;
        return transactionDate === today;
      });
    } else if (filterDate === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.created_at || t.show_date);
        return transactionDate >= oneWeekAgo;
      });
    } else if (filterDate === 'month') {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.created_at || t.show_date);
        return transactionDate >= firstDayOfMonth;
      });
    }

    setFilteredTransactions(filtered);
  };

  const calculateStats = () => {
    const successTransactions = filteredTransactions.filter(t => t.status === 'success');
    setStats({
      totalTransactions: filteredTransactions.length,
      totalRevenue: successTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0),
      totalTickets: successTransactions.reduce((sum, t) => sum + (t.ticket_count || 0), 0),
      successRate: filteredTransactions.length > 0 
        ? ((successTransactions.length / filteredTransactions.length) * 100).toFixed(1)
        : 0
    });
  };

  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handlePrintTicket = async (transaction) => {
    await markAsPrinted(transaction.id);

    const ticketWindow = window.open('', '_blank', 'width=400,height=600');
    const ticketHTML = `
      <html>
        <head>
          <title>Cetak Tiket - ${transaction.ticket_number}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px;
              background: white;
              color: black;
            }
            .ticket { 
              border: 2px dashed #000; 
              padding: 20px; 
              max-width: 350px;
              margin: 0 auto;
            }
            .center { text-align: center; }
            .divider { 
              border-top: 1px dashed #000; 
              margin: 10px 0; 
            }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="center bold" style="font-size: 18px; margin-bottom: 10px;">BIOSKOP CINEMA</div>
            <div class="center" style="margin-bottom: 15px;">Tiket Film</div>
            <div class="divider"></div>
            
            <div class="bold" style="font-size: 16px; margin: 10px 0;">${transaction.movie_title || 'N/A'}</div>
            <div>Studio: ${transaction.studio || 'N/A'}</div>
            <div>Tanggal: ${transaction.show_date ? new Date(transaction.show_date).toLocaleDateString('id-ID') : 'N/A'}</div>
            <div>Jam: ${transaction.show_time || 'N/A'}</div>
            
            <div class="divider"></div>
            
            <div>No. Tiket: ${transaction.ticket_number || 'N/A'}</div>
            <div>Kursi: ${transaction.seats ? transaction.seats.join(', ') : 'N/A'}</div>
            <div>Pelanggan: ${transaction.customer_name || 'N/A'}</div>
            
            <div class="divider"></div>
            
            <div class="center bold" style="font-size: 18px; margin: 10px 0;">
              Total: Rp ${transaction.total_amount ? transaction.total_amount.toLocaleString('id-ID') : '0'}
            </div>
            
            <div class="center" style="margin-top: 20px; font-style: italic;">
              Terima Kasih
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 500);
          </script>
        </body>
      </html>
    `;
    ticketWindow.document.write(ticketHTML);
    ticketWindow.document.close();
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: { bg: 'bg-green-500', text: 'Berhasil', icon: CheckCircle },
      pending: { bg: 'bg-yellow-500', text: 'Pending', icon: Clock },
      failed: { bg: 'bg-red-500', text: 'Gagal', icon: XCircle }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`${badge.bg} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
        <Icon size={14} />
        {badge.text}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methods = {
      cash: { bg: 'bg-blue-500', text: 'Cash' },
      transfer: { bg: 'bg-purple-500', text: 'Transfer' },
      gopay: { bg: 'bg-green-500', text: 'GoPay' },
      dana: { bg: 'bg-cyan-500', text: 'DANA' },
      ovo: { bg: 'bg-purple-600', text: 'OVO' },
      bca: { bg: 'bg-blue-600', text: 'BCA' },
      mandiri: { bg: 'bg-yellow-600', text: 'Mandiri' }
    };
    const badge = methods[method] || methods.cash;
    return (
      <span className={`${badge.bg} text-white px-2 py-1 rounded text-xs font-semibold`}>
        {badge.text}
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const debugData = () => {
    console.log('Transactions data:', transactions);
    console.log('First transaction:', transactions[0]);
    alert(`Data transaksi: ${transactions.length} records\nLihat detail di console browser`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingCart className="text-yellow-400" size={36} />
            Data Transaksi Payments
          </h1>
          <p className="text-gray-400">Data langsung dari database - Real Transactions</p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={20} />
                <span className="font-semibold">Error:</span>
              </div>
              <p className="text-red-400 mt-2">{error}</p>
              <div className="mt-3 text-sm text-red-300">
                <p>Pastikan:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Server Laravel berjalan di {API_BASE}</li>
                  <li>Endpoint /api/payments tersedia</li>
                  <li>Database memiliki data payment</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <ShoppingCart className="text-blue-400" size={24} />
              </div>
              <span className="text-gray-400 text-sm">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalTransactions}</h3>
            <p className="text-gray-400 text-sm">Transaksi</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <DollarSign className="text-yellow-400" size={24} />
              </div>
              <span className="text-gray-400 text-sm">Revenue</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Rp {formatPrice(stats.totalRevenue)}</h3>
            <p className="text-gray-400 text-sm">Total Pendapatan</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CreditCard className="text-green-400" size={24} />
              </div>
              <span className="text-gray-400 text-sm">Tiket</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalTickets}</h3>
            <p className="text-gray-400 text-sm">Tiket Terjual</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
              <span className="text-gray-400 text-sm">Success Rate</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.successRate}%</h3>
            <p className="text-gray-400 text-sm">Tingkat Berhasil</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-6 mb-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari tiket, pelanggan, atau film..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              >
                <option value="all">Semua Status</option>
                <option value="success">Berhasil</option>
                <option value="pending">Pending</option>
                <option value="failed">Gagal</option>
              </select>
            </div>

            <div>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              >
                <option value="all">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={loadTransactions}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh Data
            </button>
            <button 
              onClick={debugData}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Eye size={18} />
              Debug Data
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                <span className="ml-4 text-white">Memuat data transaksi dari database...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
                <p className="text-red-400 text-lg mb-2">Gagal memuat data</p>
                <p className="text-gray-400 mb-4">{error}</p>
                <button 
                  onClick={loadTransactions}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg font-semibold"
                >
                  Coba Lagi
                </button>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="mx-auto text-gray-500 mb-4" size={64} />
                <p className="text-gray-400 text-lg">Tidak ada transaksi ditemukan</p>
                <p className="text-gray-500 text-sm mt-2">
                  {transactions.length === 0 
                    ? 'Database payment kosong atau tidak terhubung' 
                    : 'Coba ubah filter pencarian'
                  }
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-600">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">No. Tiket</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Pelanggan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Film</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Jadwal</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Kursi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Metode</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">{transaction.ticket_number}</div>
                        <div className="text-gray-400 text-xs">{formatDate(transaction.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{transaction.customer_name}</div>
                        <div className="text-gray-400 text-xs">{transaction.customer_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{transaction.movie_title}</div>
                        <div className="text-gray-400 text-xs">{transaction.studio}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{formatDate(transaction.show_date)}</div>
                        <div className="text-gray-400 text-xs">{transaction.show_time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {transaction.seats && transaction.seats.map((seat, idx) => (
                            <span key={idx} className="bg-slate-600 text-white px-2 py-1 rounded text-xs">
                              {seat}
                            </span>
                          ))}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">{transaction.ticket_count} tiket</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-bold">Rp {formatPrice(transaction.total_amount)}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentMethodBadge(transaction.payment_method)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(transaction.status)}
                        {transaction.is_printed && (
                          <div className="mt-1 text-green-400 text-xs flex items-center gap-1">
                            <Printer size={12} />
                            Tercetak
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetail(transaction)}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            title="Detail"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handlePrintTicket(transaction)}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            title="Cetak Tiket"
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail Modal - sama seperti sebelumnya */}
        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* ... modal content sama seperti sebelumnya ... */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierDataTransaksi;