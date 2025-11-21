import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const CashierLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/cashier', icon: '📊', label: 'Dashboard' },
    { path: '/cashier/DataTransaksi', icon: '📊', label: 'Data Transaksi' },
  
   
  ];

  const handleLogout = () => {
    // Hapus semua data dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    
    // Trigger event untuk update navbar
    window.dispatchEvent(new Event('userChanged'));

    // Redirect ke halaman login
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-screen fixed">
        {/* Bagian atas scrollable */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-8">🎬 Admin Panel</h2>
          <nav className="space-y-2">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-yellow-500 text-black font-semibold'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Tombol keluar tetap di bawah */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <span className="text-xl">🚪</span>
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default CashierLayout;
