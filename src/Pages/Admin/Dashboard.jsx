import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total Film', value: '45', icon: '🎬', color: 'bg-blue-500' },
    { title: 'Total User', value: '1,234', icon: '👥', color: 'bg-green-500' },
    { title: 'Penjualan Hari Ini', value: 'Rp 2.5M', icon: '💰', color: 'bg-yellow-500' },
    { title: 'Tiket Terjual', value: '89', icon: '🎫', color: 'bg-purple-500' }
  ];

  const menuItems = [
    { title: 'Kelola Film', path: '/admin/movies', icon: '🎬', desc: 'Tambah, edit, hapus film' },
    { title: 'Kelola User', path: '/admin/users', icon: '👥', desc: 'Manajemen pelanggan' },
    { title: 'Kelola Jadwal', path: '/admin/schedules', icon: '📅', desc: 'Atur jadwal tayang' },
    { title: 'Kelola Studio', path: '/admin/studios', icon: '🎭', desc: 'Manajemen studio bioskop' },
    { title: 'Kelola Harga', path: '/admin/prices', icon: '💰', desc: 'Setting harga tiket' },
    { title: 'Kelola Kasir', path: '/admin/cashiers', icon: '🏪', desc: 'Manajemen kasir' },
    { title: 'Kelola Kursi', path: '/admin/seats', icon: '🪑', desc: 'Setting kursi bioskop' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Admin</h1>
          <p className="text-gray-400">Kelola sistem bioskop Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 border border-gray-700 transition-colors group"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-400">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;