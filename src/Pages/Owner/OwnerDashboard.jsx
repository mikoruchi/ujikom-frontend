import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayRevenue: 0,
    monthlyRevenue: 0,
    periodRevenue: 0,
    totalTickets: 0,
    totalCustomers: 0,
    period: 'week',
    startDate: '',
    endDate: ''
  });
  
  const [salesData, setSalesData] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [movieBarChartData, setMovieBarChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('week');
  const [exportLoading, setExportLoading] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [dateDebug, setDateDebug] = useState('');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Create axios instance
  const createApiInstance = () => {
    const instance = axios.create({
      baseURL: 'http://localhost:8000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        if (error.code === 'ERR_NETWORK') {
          throw new Error('Tidak dapat terhubung ke server. Pastikan backend Laravel berjalan di port 8000.');
        }
        if (error.response?.status === 401) {
          handleLogout();
          throw new Error('Session expired. Silakan login kembali.');
        }
        throw error;
      }
    );

    return instance;
  };

  // Fetch dashboard data dengan penanganan tanggal yang lebih baik
  const fetchDashboardData = async (selectedPeriod = period, startDate = '', endDate = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }

      // PERBAIKAN: Debug informasi tanggal
      const debugInfo = `Period: ${selectedPeriod}, Start: ${startDate}, End: ${endDate}`;
      setDateDebug(debugInfo);
      console.log('🔄 Fetching dashboard data:', debugInfo);
      
      const api = createApiInstance();
      const params = { period: selectedPeriod };
      
      // PERBAIKAN: Pastikan tanggal dikirim dengan format yang benar
      if (selectedPeriod === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      } else if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      console.log('📊 API Params:', params);

      const response = await api.get('/owner/dashboard/stats', {
        params: params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Dashboard response:', response.data);

      if (response.data.success) {
        const data = response.data.data;
        
        setStats(data.stats);
        setSalesData(data.salesData);
        setTopMovies(data.topMovies);
        setMovieBarChartData(data.movieBarChartData || []);
        
        // PERBAIKAN: Log data untuk debugging
        console.log('📈 Sales data count:', data.salesData.length);
        console.log('🎬 Top movies count:', data.topMovies.length);
        console.log('📊 Movie chart data count:', data.movieBarChartData?.length || 0);
        
      } else {
        setError(response.data.message || 'Gagal memuat data dashboard');
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      
      let errorMessage = 'Terjadi kesalahan saat memuat data';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan: 1) Backend Laravel berjalan (php artisan serve), 2) Port 8000 tidak digunakan aplikasi lain';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod === 'custom') {
      // Jika custom, gunakan tanggal yang sudah dipilih
      if (customStartDate && customEndDate) {
        fetchDashboardData('custom', customStartDate, customEndDate);
      } else {
        // Jika belum ada tanggal, gunakan default 7 hari terakhir
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        
        setCustomStartDate(startStr);
        setCustomEndDate(endStr);
        fetchDashboardData('custom', startStr, endStr);
      }
    } else {
      fetchDashboardData(newPeriod);
    }
  };

  // Handle custom date filter
  const handleCustomDateFilter = () => {
    if (!customStartDate || !customEndDate) {
      alert('Harap pilih tanggal awal dan tanggal akhir');
      return;
    }
    
    if (new Date(customStartDate) > new Date(customEndDate)) {
      alert('Tanggal awal tidak boleh lebih besar dari tanggal akhir');
      return;
    }
    
    setPeriod('custom');
    fetchDashboardData('custom', customStartDate, customEndDate);
  };

  // Reset to current week
  const handleResetToCurrentWeek = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    setCustomStartDate(start.toISOString().split('T')[0]);
    setCustomEndDate(end.toISOString().split('T')[0]);
    setPeriod('week');
    fetchDashboardData('week');
  };

  // Calculate max values for charts
  const maxRevenue = Math.max(...salesData.map(item => item.revenue), 1);
  const maxMovieRevenue = topMovies.length > 0 
    ? Math.max(...topMovies.map(movie => movie.revenue))
    : 1;

  // Export to CSV
  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      
      const token = localStorage.getItem('token');
      const api = createApiInstance();
      
      const params = { period: period };
      if (period === 'custom') {
        params.start_date = customStartDate;
        params.end_date = customEndDate;
      }

      const response = await api.get('/owner/dashboard/export-data', {
        params: params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal mengambil data export');
      }

      const exportData = response.data.data;
      
      // Create CSV content
      let csvContent = "LAPORAN PENDAPATAN CINEMA - SISTEM MANAJEMEN BIOSKOP\n";
      csvContent += "=".repeat(50) + "\n";
      csvContent += `Periode Laporan: ${exportData.periodLabel}\n`;
      csvContent += `Dibuat: ${new Date(exportData.exportTime).toLocaleString('id-ID')}\n`;
      csvContent += "=".repeat(50) + "\n\n";
      
      // Summary Stats
      csvContent += "RINGKASAN STATISTIK\n";
      csvContent += "-".repeat(30) + "\n";
      csvContent += "Item,Nilai\n";
      csvContent += `Pendapatan Hari Ini,${formatCurrency(exportData.summary.todayRevenue)}\n`;
      csvContent += `Pendapatan Bulan Ini,${formatCurrency(exportData.summary.monthlyRevenue)}\n`;
      csvContent += `Pendapatan Tahun Ini,${formatCurrency(exportData.summary.yearlyRevenue)}\n`;
      csvContent += `Pendapatan Periode ${exportData.periodLabel},${formatCurrency(exportData.summary.periodRevenue)}\n\n`;
      
      // Top Movies
      if (topMovies.length > 0) {
        csvContent += "FILM TERLARIS\n";
        csvContent += "-".repeat(30) + "\n";
        csvContent += "Rank,Judul Film,Tiket Terjual,Pendapatan\n";
        topMovies.forEach((movie, index) => {
          csvContent += `${index + 1},${movie.title},${movie.tickets},${formatCurrency(movie.revenue)}\n`;
        });
      }
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `laporan-cinema-${period}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('✅ Laporan berhasil diexport ke CSV!');
      
    } catch (err) {
      console.error('Error generating CSV:', err);
      alert('❌ Gagal membuat CSV: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Print Report
  const printReport = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Cinema - ${period}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 20px; }
          .section { margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .total { font-weight: bold; background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN PENDAPATAN CINEMA</h1>
          <h2>Periode: ${stats.startDate} - ${stats.endDate}</h2>
          <p>Dibuat: ${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <div class="summary">
          <h3>Ringkasan Statistik</h3>
          <p>Pendapatan Hari Ini: ${formatCurrency(stats.todayRevenue)}</p>
          <p>Pendapatan Bulan Ini: ${formatCurrency(stats.monthlyRevenue)}</p>
          <p>Pendapatan Periode: ${formatCurrency(stats.periodRevenue)}</p>
          <p>Total Tiket: ${stats.totalTickets.toLocaleString()}</p>
          <p>Total Pelanggan: ${stats.totalCustomers.toLocaleString()}</p>
        </div>
        
        ${topMovies.length > 0 ? `
        <div class="section">
          <h3>Film Terlaris</h3>
          <table>
            <thead>
              <tr>
                <th>Film</th>
                <th>Tiket</th>
                <th>Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              ${topMovies.map(movie => `
                <tr>
                  <td>${movie.title}</td>
                  <td>${movie.tickets}</td>
                  <td>${formatCurrency(movie.revenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Initialize default dates
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setCustomStartDate(startStr);
    setCustomEndDate(endStr);
    fetchDashboardData('week');
  }, []);

  // Refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 300000);

    return () => clearInterval(interval);
  }, [period, customStartDate, customEndDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dashboard...</p>
          {dateDebug && (
            <p className="text-xs text-gray-400 mt-2">Debug: {dateDebug}</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            🔄 Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Owner</h1>
            <p className="text-gray-600">Manajemen dan Monitoring Bioskop</p>
            <p className="text-sm text-gray-500 mt-1">
              Periode: {formatDateDisplay(stats.startDate)} - {formatDateDisplay(stats.endDate)}
            </p>
            {/* Debug info */}
            <p className="text-xs text-blue-600 mt-1">
              Data ditampilkan: {salesData.length} hari, {topMovies.length} film
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={exportLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <span>{exportLoading ? '⏳' : '📊'}</span>
              <span>{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
            </button>
            
            <button
              onClick={printReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <span>🖨️</span>
              <span>Print</span>
            </button>

            <button
              onClick={() => fetchDashboardData()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Period Filter dengan Date Range */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Filter Periode</h3>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePeriodChange('week')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === 'week' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📅 Minggu Ini
              </button>
              <button
                onClick={() => handlePeriodChange('month')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === 'month' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Bulan Ini
              </button>
              <button
                onClick={() => handlePeriodChange('year')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === 'year' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📈 Tahun Ini
              </button>
              <button
                onClick={handleResetToCurrentWeek}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Reset
              </button>
            </div>

            {/* Custom Date Range */}
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Dari:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Sampai:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleCustomDateFilter}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === 'custom' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Terapkan Filter
              </button>
            </div>
          </div>
          
          {/* Informasi Filter */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-sm text-blue-700">
              <span className="mr-2">ℹ️</span>
              <span>
                Filter aktif: <strong>{period === 'custom' ? 'Custom' : period}</strong> | 
                Menampilkan data dari <strong>{formatDateDisplay(stats.startDate)}</strong> sampai <strong>{formatDateDisplay(stats.endDate)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendapatan Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.todayRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendapatan Periode</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.periodRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {period === 'week' ? 'Minggu Ini' : period === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tiket Terjual</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalTickets.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">🎫</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalCustomers.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {period === 'week' ? 'Penjualan 7 Hari Terakhir' : 
                 period === 'month' ? 'Penjualan per Minggu' : 
                 'Penjualan per Bulan'}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Total: {formatCurrency(salesData.reduce((sum, item) => sum + item.revenue, 0))}
              </span>
            </div>
            {salesData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📈</div>
                <p>Tidak ada data penjualan untuk periode ini</p>
                <p className="text-sm mt-2">Coba pilih periode atau tanggal yang berbeda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {salesData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {formatDateDisplay(data.date)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {data.tickets} tiket
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${(data.revenue / maxRevenue) * 100}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                      <div className="text-right text-sm font-medium text-blue-600 mt-1">
                        {formatCurrency(data.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grafik Batang Vertikal Film Terlaris */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {period === 'week' || period === 'custom' ? 'Grafik Film per Tanggal' : 'Film Terlaris'}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {period === 'week' || period === 'custom' ? movieBarChartData.length + ' hari' : topMovies.length + ' film'}
              </span>
            </div>

            {period === 'week' || period === 'custom' ? (
              // Grafik untuk periode minggu/custom (per tanggal)
              movieBarChartData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎬</div>
                  <p>Tidak ada data film untuk periode ini</p>
                  <p className="text-sm mt-2">Coba pilih periode atau tanggal yang berbeda</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {movieBarChartData.map((dayData, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-800">
                          {formatDateDisplay(dayData.date)}
                        </h3>
                        <span className="text-sm text-green-600 font-medium">
                          {formatCurrency(dayData.totalRevenue)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {dayData.movies.map((movie, movieIndex) => (
                          <div key={movieIndex} className="flex items-center">
                            <div className="w-32 text-xs text-gray-600 truncate mr-2">
                              {movie.title}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>{movie.tickets} tiket</span>
                                <span>{formatCurrency(movie.revenue)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-purple-600 h-3 rounded-full text-xs text-white flex items-center justify-end pr-2 font-medium"
                                  style={{ 
                                    width: `${(movie.revenue / maxMovieRevenue) * 100}%`,
                                    minWidth: '40px'
                                  }}
                                >
                                  {((movie.revenue / maxMovieRevenue) * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // GRAFIK BATANG VERTIKAL untuk periode bulan/tahun (top movies)
              topMovies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎬</div>
                  <p>Tidak ada data film untuk periode ini</p>
                  <p className="text-sm mt-2">Coba pilih periode atau tanggal yang berbeda</p>
                </div>
              ) : (
                <div className="flex flex-col h-80">
                  {/* Y-axis labels */}
                  <div className="flex justify-end mb-2 pr-4">
                    <div className="text-xs text-gray-500 text-right">
                      Pendapatan (Jutaan Rupiah)
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-end justify-between space-x-2 px-4 border-b border-l border-gray-300">
                    {topMovies.map((movie, index) => {
                      const barHeight = (movie.revenue / maxMovieRevenue) * 100;
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          {/* Bar */}
                          <div
                            className="w-full bg-gradient-to-t from-green-500 to-green-600 rounded-t transition-all duration-500 relative group"
                            style={{ height: `${barHeight}%` }}
                          >
                            {/* Tooltip on hover */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {formatCurrency(movie.revenue)}
                              <div className="text-green-400">{movie.tickets} tiket</div>
                            </div>
                            
                            {/* Value inside bar (only show if bar is tall enough) */}
                            {barHeight > 20 && (
                              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">
                                {formatCurrency(movie.revenue)}
                              </div>
                            )}
                          </div>
                          
                          {/* X-axis label (Movie title) */}
                          <div className="mt-2 text-xs text-gray-600 text-center truncate w-full px-1">
                            {movie.title}
                          </div>
                          
                          {/* Rank number */}
                          <div className="mt-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* X-axis title */}
                  <div className="flex justify-center mt-2">
                    <div className="text-xs text-gray-500">
                      Film Terlaris
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center mt-4 space-x-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                      <span className="text-gray-600">Pendapatan Film</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                      <span className="text-gray-600">Ranking</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="text-center bg-white p-3 rounded-lg shadow">
            <div className="font-semibold text-blue-600">Auto Refresh</div>
            <div>Data diperbarui setiap 5 menit</div>
          </div>
          <div className="text-center bg-white p-3 rounded-lg shadow">
            <div className="font-semibold text-green-600">Terakhir Diperbarui</div>
            <div>{new Date().toLocaleString('id-ID')}</div>
          </div>
          <div className="text-center bg-white p-3 rounded-lg shadow">
            <div className="font-semibold text-purple-600">System Info</div>
            <div>© {new Date().getFullYear()} Cinema Management System</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;