import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCashiers = () => {
  const [cashiers, setCashiers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shift: "Pagi",
    password: "",
    password_confirmation: ""
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || 
           localStorage.getItem('auth_token') ||
           sessionStorage.getItem('token');
  };

  // Create axios instance with auth
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

  // LOAD DATA DARI API
  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    try {
      setLoading(true);
      const api = createApiInstance();
      const res = await api.get("/cashiers");
      
      if (res.data.success) {
        setCashiers(res.data.data);
      } else {
        console.error('Error response:', res.data);
        alert('Gagal mengambil data: ' + (res.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching cashiers:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Silakan login kembali.');
        window.location.href = '/login';
      } else if (error.response?.data?.message) {
        alert('Error: ' + error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR') {
        alert('Tidak dapat terhubung ke server. Pastikan backend Laravel berjalan.');
      } else {
        alert('Gagal mengambil data kasir: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // SUBMIT TAMBAH KASIR
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi password
    if (formData.password.length < 6) {
      alert('Password harus minimal 6 karakter');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      alert('Konfirmasi password tidak cocok');
      return;
    }
    
    try {
      setLoading(true);
      const api = createApiInstance();
      const response = await api.post("/cashiers", formData);

      if (response.data.success) {
        alert('Kasir berhasil ditambahkan!');
        fetchCashiers();
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          shift: "Pagi",
          password: "",
          password_confirmation: ""
        });
      } else {
        alert('Gagal menambah kasir: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error adding cashier:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        alert(`Gagal menambah kasir: ${errorMessages.join(', ')}`);
      } else {
        alert('Gagal menambah kasir: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // UPDATE STATUS
  const toggleStatus = async (id) => {
    try {
      const api = createApiInstance();
      const response = await api.put(`/cashiers/${id}/status`);
      
      if (response.data.success) {
        alert('Status berhasil diubah!');
        fetchCashiers();
      } else {
        alert('Gagal mengubah status: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Gagal mengubah status: ' + (error.response?.data?.message || error.message));
    }
  };

  // DELETE KASIR
  const deleteCashier = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kasir ini?')) {
      return;
    }

    try {
      const api = createApiInstance();
      const response = await api.delete(`/cashiers/${id}`);
      
      if (response.data.success) {
        alert('Kasir berhasil dihapus!');
        fetchCashiers();
      } else {
        alert('Gagal menghapus kasir: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error deleting cashier:', error);
      alert('Gagal menghapus kasir: ' + (error.response?.data?.message || error.message));
    }
  };

  // Test connection
  const testConnection = async () => {
    try {
      const api = createApiInstance();
      const response = await api.get('/cashiers');
      alert('Koneksi berhasil! Jumlah kasir: ' + response.data.data.length);
    } catch (error) {
      alert('Koneksi gagal: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Kelola Kasir</h1>

          <div className="flex gap-2">
            <button
              onClick={testConnection}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Test Koneksi
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold"
            >
              + Tambah Kasir
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && cashiers.length === 0 && (
          <div className="text-white text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4">Memuat data kasir...</p>
          </div>
        )}

        {/* FORM TAMBAH */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Tambah Kasir Baru</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nama Lengkap"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600"
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600"
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Nomor Telepon"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600"
                  required
                />

                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600"
                >
                  <option value="Pagi">Pagi (08:00-16:00)</option>
                  <option value="Siang">Siang (16:00-00:00)</option>
                  <option value="Malam">Malam (00:00-08:00)</option>
                </select>

                {/* TAMBAHAN: FIELD PASSWORD */}
                <input
                  type="password"
                  name="password"
                  placeholder="Password (minimal 6 karakter)"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600"
                  required
                  minLength={6}
                />

                {/* TAMBAHAN: FIELD KONFIRMASI PASSWORD */}
                <input
                  type="password"
                  name="password_confirmation"
                  placeholder="Konfirmasi Password"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600"
                  required
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        shift: "Pagi",
                        password: "",
                        password_confirmation: ""
                      });
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TABEL */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left text-white p-4">Nama</th>
                <th className="text-left text-white p-4">Email</th>
                <th className="text-left text-white p-4">Telepon</th>
                <th className="text-left text-white p-4">Shift</th>
                <th className="text-left text-white p-4">Status</th>
                <th className="text-left text-white p-4">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {cashiers.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="text-center text-gray-400 p-8">
                    Belum ada data kasir
                  </td>
                </tr>
              ) : (
                cashiers.map((cashier) => (
                  <tr key={cashier.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-semibold">
                          {cashier.name.charAt(0)}
                        </div>
                        <span className="text-white font-medium">{cashier.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{cashier.email}</td>
                    <td className="p-4 text-gray-300">{cashier.phone}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        cashier.shift === 'Pagi' ? 'bg-yellow-500 text-black' :
                        cashier.shift === 'Siang' ? 'bg-orange-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {cashier.shift}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          cashier.status === "active"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {cashier.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStatus(cashier.id)}
                          className={`px-3 py-1 rounded text-sm ${
                            cashier.status === 'active' 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {cashier.status === 'active' ? 'Nonaktif' : 'Aktifkan'}
                        </button>

                        <button
                          onClick={() => deleteCashier(cashier.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Statistik Sederhana */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">📊 Statistik Kasir</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Kasir:</span>
                <span className="text-white">{cashiers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Aktif:</span>
                <span className="text-green-400">
                  {cashiers.filter(c => c.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nonaktif:</span>
                <span className="text-red-400">
                  {cashiers.filter(c => c.status === 'inactive').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">⏰ Jadwal Shift</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Pagi:</span>
                <span className="text-yellow-400">
                  {cashiers.filter(c => c.shift === 'Pagi').length} kasir
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Siang:</span>
                <span className="text-orange-400">
                  {cashiers.filter(c => c.shift === 'Siang').length} kasir
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Malam:</span>
                <span className="text-blue-400">
                  {cashiers.filter(c => c.shift === 'Malam').length} kasir
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">💼 Info Penting</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Minimal 2 kasir per shift</li>
              <li>• Backup kasir untuk weekend</li>
              <li>• Training rutin setiap bulan</li>
              <li>• Evaluasi performa berkala</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCashiers;