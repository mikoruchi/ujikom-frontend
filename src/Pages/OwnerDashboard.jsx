import React, { useState, useEffect } from 'react';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalTickets: 0,
    totalCustomers: 0
  });
  
  const [salesData, setSalesData] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      todayRevenue: 2500000,
      monthlyRevenue: 45000000,
      totalTickets: 1250,
      totalCustomers: 890
    });

    setSalesData([
      { date: '2024-01-01', revenue: 1200000, tickets: 48 },
      { date: '2024-01-02', revenue: 1800000, tickets: 72 },
      { date: '2024-01-03', revenue: 2200000, tickets: 88 },
      { date: '2024-01-04', revenue: 1600000, tickets: 64 },
      { date: '2024-01-05', revenue: 2500000, tickets: 100 }
    ]);

    setTopMovies([
      { title: 'Avengers: Endgame', tickets: 320, revenue: 16000000 },
      { title: 'Spider-Man', tickets: 280, revenue: 12600000 },
      { title: 'Batman', tickets: 250, revenue: 13750000 }
    ]);

    setRecentTransactions([
      { id: 'TXN001', customer: 'John Doe', movie: 'Avengers', seats: 'A1,A2', total: 100000, time: '14:30' },
      { id: 'TXN002', customer: 'Jane Smith', movie: 'Spider-Man', seats: 'B5', total: 45000, time: '14:25' },
      { id: 'TXN003', customer: 'Bob Wilson', movie: 'Batman', seats: 'C3,C4,C5', total: 165000, time: '14:20' }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Owner</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendapatan Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {stats.todayRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendapatan Bulan Ini</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tiket Terjual</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalTickets}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">🎫</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Penjualan 5 Hari Terakhir</h2>
            <div className="space-y-4">
              {salesData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(data.date).toLocaleDateString('id-ID')}
                      </span>
                      <span className="text-sm text-gray-600">{data.tickets} tiket</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(data.revenue / 2500000) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm font-medium text-blue-600 mt-1">
                      Rp {data.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Movies */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Film Terlaris</h2>
            <div className="space-y-4">
              {topMovies.map((movie, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{movie.title}</div>
                      <div className="text-sm text-gray-600">{movie.tickets} tiket terjual</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      Rp {movie.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Transaksi Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Transaksi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Film</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kursi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.movie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.seats}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      Rp {transaction.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;