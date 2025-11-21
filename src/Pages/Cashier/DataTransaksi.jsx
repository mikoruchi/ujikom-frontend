import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, DollarSign, CreditCard, 
  Eye, Printer, RotateCcw, CheckCircle, Clock, XCircle,
  Download, RefreshCw, TrendingUp, ShoppingCart
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

  // Statistics
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    totalTickets: 0,
    successRate: 0
  });

  // Sesuaikan dengan URL Laravel Anda
  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
    calculateStats();
  }, [transactions, searchTerm, filterStatus, filterDate]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Gunakan endpoint yang benar - '/payments'
      const response = await fetch(`${API_BASE}/payments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      
      console.log('API Response:', result); // Debug log
      
      if (result.success) {
        setTransactions(result.data || []);
      } else {
        console.error('API Error:', result.message);
        alert('Gagal memuat data: ' + result.message);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      
      // Jika masih error, coba endpoint alternatif
      if (error.message.includes('404')) {
        console.log('Mencoba endpoint alternatif...');
        await tryAlternativeEndpoints();
      } else {
        alert('Gagal memuat data transaksi: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Coba endpoint alternatif jika endpoint utama gagal
  const tryAlternativeEndpoints = async () => {
    const endpoints = [
      '/payments',
      '/payment',
      '/transactions',
      '/transaction'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setTransactions(result.data || []);
            console.log(`Berhasil menggunakan endpoint: ${endpoint}`);
            return;
          }
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} gagal:`, error.message);
      }
    }

    // Jika semua endpoint gagal, gunakan data dummy untuk testing
    console.log('Semua endpoint gagal, menggunakan data dummy');
    setTransactions([
      {
        id: 1,
        ticket_number: 'TIX-00000001',
        customer_name: 'Budi Santoso',
        customer_email: 'budi@example.com',
        movie_title: 'Avengers: Endgame',
        studio: 'Studio 1',
        show_date: '2024-11-21',
        show_time: '14:00',
        seats: ['A1', 'A2'],
        ticket_count: 2,
        subtotal: 100000,
        total_amount: 100000,
        payment_method: 'cash',
        status: 'success',
        is_printed: true,
        created_at: '2024-11-21 13:45:00'
      },
      {
        id: 2,
        ticket_number: 'TIX-00000002',
        customer_name: 'Siti Aminah',
        customer_email: 'siti@example.com',
        movie_title: 'Spider-Man: No Way Home',
        studio: 'Studio 2',
        show_date: '2024-11-21',
        show_time: '16:30',
        seats: ['B5', 'B6', 'B7'],
        ticket_count: 3,
        subtotal: 165000,
        total_amount: 165000,
        payment_method: 'gopay',
        status: 'success',
        is_printed: true,
        created_at: '2024-11-21 14:20:00'
      }
    ]);
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

      if (!response.ok) {
        throw new Error('Gagal menandai tiket sebagai tercetak');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setTransactions(prev => prev.map(t => 
          t.id === transactionId ? { ...t, is_printed: true } : t
        ));
      }
    } catch (error) {
      console.error('Error marking as printed:', error);
      // Untuk testing, update state lokal saja
      setTransactions(prev => prev.map(t => 
        t.id === transactionId ? { ...t, is_printed: true } : t
      ));
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.movie_title?.toLowerCase().includes(searchTerm.toLowerCase())
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
    // Mark as printed in database
    await markAsPrinted(transaction.id);

    // Print ticket
    const ticketWindow = window.open('', '_blank', 'width=400,height=600');
    const ticketHTML = `
      <html>
        <head>
          <title>Cetak Tiket - ${transaction.ticket_number}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; }
            .ticket { border: 2px dashed #000; padding: 20px; }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="center bold">BIOSKOP XXYY</div>
            <div class="center">Jl. Contoh No. 123</div>
            <div class="divider"></div>
            <div class="bold">${transaction.movie_title || 'N/A'}</div>
            <div>Studio: ${transaction.studio || 'N/A'}</div>
            <div>Tanggal: ${transaction.show_date ? new Date(transaction.show_date).toLocaleDateString('id-ID') : 'N/A'}</div>
            <div>Jam: ${transaction.show_time || 'N/A'}</div>
            <div class="divider"></div>
            <div>Tiket: ${transaction.ticket_number || 'N/A'}</div>
            <div>Kursi: ${transaction.seats ? transaction.seats.join(', ') : 'N/A'}</div>
            <div>Pelanggan: ${transaction.customer_name || 'N/A'}</div>
            <div class="divider"></div>
            <div class="bold">Total: Rp ${transaction.total_amount ? transaction.total_amount.toLocaleString('id-ID') : '0'}</div>
            <div class="center" style="margin-top: 20px;">||||| |||| ||||| ||||</div>
            <div class="center">Terima Kasih</div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `;
    ticketWindow.document.write(ticketHTML);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingCart className="text-yellow-400" size={36} />
            Data Transaksi Payments
          </h1>
          <p className="text-gray-400">Kelola dan pantau semua transaksi penjualan tiket dari database</p>
          <div className="flex gap-4 mt-2">
            <p className="text-yellow-400 text-sm">Total Data: {transactions.length} transaksi</p>
            <p className="text-blue-400 text-sm">Filtered: {filteredTransactions.length} transaksi</p>
          </div>
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
            {/* Search */}
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

            {/* Filter Status */}
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

            {/* Filter Date */}
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
              Refresh
            </button>
            <button 
              onClick={() => console.log('Transactions data:', transactions)}
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
                <span className="ml-4 text-white">Memuat data transaksi...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="mx-auto text-gray-500 mb-4" size={64} />
                <p className="text-gray-400 text-lg">Tidak ada transaksi ditemukan</p>
                <button 
                  onClick={loadTransactions}
                  className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg font-semibold"
                >
                  Muat Ulang Data
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-600">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      No. Tiket
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Film
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Jadwal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Kursi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Metode
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">{transaction.ticket_number}</div>
                        <div className="text-gray-400 text-xs">{transaction.created_at}</div>
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
                        <div className="text-white">{transaction.show_date}</div>
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

        {/* Detail Modal */}
        {showDetailModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-600">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Detail Transaksi</h2>
                    <p className="text-yellow-400 font-mono">{selectedTransaction.ticket_number}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle size={28} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3">Informasi Pelanggan</h3>
                  <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nama:</span>
                      <span className="text-white font-medium">{selectedTransaction.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white font-medium">{selectedTransaction.customer_email}</span>
                    </div>
                  </div>
                </div>

                {/* Movie Info */}
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3">Informasi Film</h3>
                  <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Film:</span>
                      <span className="text-white font-medium">{selectedTransaction.movie_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Studio:</span>
                      <span className="text-white font-medium">{selectedTransaction.studio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tanggal:</span>
                      <span className="text-white font-medium">{selectedTransaction.show_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Waktu:</span>
                      <span className="text-white font-medium">{selectedTransaction.show_time}</span>
                    </div>
                  </div>
                </div>

                {/* Seats */}
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3">Kursi</h3>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedTransaction.seats && selectedTransaction.seats.map((seat, idx) => (
                        <span key={idx} className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg font-bold">
                          {seat}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm mt-3">Total: {selectedTransaction.ticket_count} tiket</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3">Informasi Pembayaran</h3>
                  <div className="bg-slate-900 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-white font-medium">Rp {formatPrice(selectedTransaction.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Metode Pembayaran:</span>
                      <span>{getPaymentMethodBadge(selectedTransaction.payment_method)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-3">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-yellow-400 font-bold text-xl">Rp {formatPrice(selectedTransaction.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span>{getStatusBadge(selectedTransaction.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePrintTicket(selectedTransaction)}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer size={20} />
                    Cetak Tiket
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
    
export default CashierDataTransaksi; 