import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPrices = () => {
  const [prices, setPrices] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studio_id: '',
    weekday_price: '',
    weekend_price: '',
    holiday_price: ''
  });

  const token = localStorage.getItem('token');
  
  const axiosConfig = {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const API_PRICES = 'http://localhost:8000/api/v1/ticket-prices';
  const API_STUDIOS = 'http://localhost:8000/api/v1/studios';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching ticket prices and studios...');
      console.log('🔑 Token:', token);
      
      const [pricesRes, studiosRes] = await Promise.all([
        axios.get(API_PRICES, axiosConfig).catch(err => {
          console.error('❌ Error fetching prices:', err.response?.data || err.message);
          return { data: [] };
        }),
        axios.get(API_STUDIOS, axiosConfig).catch(err => {
          console.error('❌ Error fetching studios:', err.response?.data || err.message);
          return { data: [] };
        })
      ]);

      console.log('💰 Prices API Response:', pricesRes.data);
      console.log('🎪 Studios API Response:', studiosRes.data);

      // Handle different response structures
      let pricesData = [];
      if (Array.isArray(pricesRes.data)) {
        pricesData = pricesRes.data;
      } else if (pricesRes.data && Array.isArray(pricesRes.data.data)) {
        pricesData = pricesRes.data.data;
      } else if (pricesRes.data && pricesRes.data.success && Array.isArray(pricesRes.data.data)) {
        pricesData = pricesRes.data.data;
      } else {
        console.warn('⚠️ Unexpected prices response structure:', pricesRes.data);
        pricesData = [];
      }

      let studiosData = [];
      if (Array.isArray(studiosRes.data)) {
        studiosData = studiosRes.data;
      } else if (studiosRes.data && Array.isArray(studiosRes.data.data)) {
        studiosData = studiosRes.data.data;
      } else if (studiosRes.data && studiosRes.data.success && Array.isArray(studiosRes.data.data)) {
        studiosData = studiosRes.data.data;
      } else {
        console.warn('⚠️ Unexpected studios response structure:', studiosRes.data);
        studiosData = [];
      }

      console.log(`✅ Processed ${pricesData.length} prices and ${studiosData.length} studios`);
      
      setPrices(pricesData);
      setStudios(studiosData);
      
    } catch (err) {
      console.error('❌ Error in fetchData:', err);
      setPrices([]);
      setStudios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (price) => {
    console.log('✏️ Editing price:', price);
    setEditingId(price.id);
    setEditData({
      weekday_price: price.weekday_price?.toString() || '',
      weekend_price: price.weekend_price?.toString() || '',
      holiday_price: price.holiday_price?.toString() || ''
    });
  };

  const handleSave = async (priceId) => {
    try {
      // Validasi
      if (!editData.weekday_price || !editData.weekend_price || !editData.holiday_price) {
        alert('❌ Semua harga harus diisi!');
        return;
      }

      const payload = {
        weekday_price: parseFloat(editData.weekday_price),
        weekend_price: parseFloat(editData.weekend_price),
        holiday_price: parseFloat(editData.holiday_price)
      };

      console.log('📤 Saving price:', payload);

      await axios.put(`${API_PRICES}/${priceId}`, payload, axiosConfig);
      alert('✅ Harga berhasil diperbarui!');
      setEditingId(null);
      setEditData({});
      fetchData();
    } catch (err) {
      console.error('❌ Error updating price:', err);
      console.error('🔍 Error details:', err.response?.data);
      alert('❌ Gagal memperbarui harga: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleAddNew = () => {
    console.log('➕ Adding new price');
    setFormData({
      studio_id: '',
      weekday_price: '',
      weekend_price: '',
      holiday_price: ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validasi form
      if (!formData.studio_id || !formData.weekday_price || !formData.weekend_price || !formData.holiday_price) {
        alert('❌ Semua field harus diisi!');
        return;
      }

      const payload = {
        studio_id: parseInt(formData.studio_id),
        weekday_price: parseFloat(formData.weekday_price),
        weekend_price: parseFloat(formData.weekend_price),
        holiday_price: parseFloat(formData.holiday_price)
      };

      console.log('📤 Adding new price:', payload);

      await axios.post(API_PRICES, payload, axiosConfig);
      alert('✅ Harga tiket berhasil ditambahkan!');
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error('❌ Error adding price:', err);
      console.error('🔍 Error details:', err.response?.data);
      alert('❌ Gagal menambahkan harga: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus harga tiket ini?')) return;
    
    try {
      await axios.delete(`${API_PRICES}/${id}`, axiosConfig);
      alert('🗑️ Harga tiket berhasil dihapus!');
      fetchData();
    } catch (err) {
      console.error('❌ Error deleting price:', err);
      alert('❌ Gagal menghapus harga: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleStatus = async (price) => {
    try {
      await axios.patch(`${API_PRICES}/${price.id}/toggle`, {}, axiosConfig);
      alert(`✅ Status harga berhasil diubah!`);
      fetchData();
    } catch (err) {
      console.error('❌ Error toggling status:', err);
      alert('❌ Gagal mengubah status harga');
    }
  };

  // STATISTICS CALCULATION
  const activePrices = prices.filter(p => p.status === 'Active' || !p.status);
  const averageWeekday = activePrices.length > 0 
    ? Math.round(activePrices.reduce((sum, p) => sum + parseFloat(p.weekday_price || 0), 0) / activePrices.length)
    : 0;
  const averageWeekend = activePrices.length > 0 
    ? Math.round(activePrices.reduce((sum, p) => sum + parseFloat(p.weekend_price || 0), 0) / activePrices.length)
    : 0;
  const averageHoliday = activePrices.length > 0 
    ? Math.round(activePrices.reduce((sum, p) => sum + parseFloat(p.holiday_price || 0), 0) / activePrices.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading data harga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Harga Tiket</h1>
            <p className="text-gray-400 mt-2">Atur harga tiket berdasarkan jenis studio dan hari</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Tambah Harga
          </button>
        </div>

        {/* DEBUG INFO */}
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-400">
            <div><strong>Debug Info:</strong></div>
            <div>Total Prices: {prices.length} | Total Studios: {studios.length}</div>
            <div>API Prices: {API_PRICES}</div>
            <div>Token: {token ? '✅ Available' : '❌ Missing'}</div>
          </div>
        </div>

        {/* ADD FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Tambah Harga Tiket Baru</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Studio Selection */}
                <div>
                  <label className="text-white text-sm block mb-2">Studio *</label>
                  <select
                    value={formData.studio_id}
                    onChange={(e) => setFormData({...formData, studio_id: e.target.value})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    required
                  >
                    <option value="">Pilih Studio</option>
                    {studios.map((studio) => (
                      <option key={studio.id} value={studio.id}>
                        {studio.studio} ({studio.description})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weekday Price */}
                <div>
                  <label className="text-white text-sm block mb-2">Harga Weekday *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 45000"
                    value={formData.weekday_price}
                    onChange={(e) => setFormData({...formData, weekday_price: e.target.value})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                {/* Weekend Price */}
                <div>
                  <label className="text-white text-sm block mb-2">Harga Weekend *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 50000"
                    value={formData.weekend_price}
                    onChange={(e) => setFormData({...formData, weekend_price: e.target.value})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                {/* Holiday Price */}
                <div>
                  <label className="text-white text-sm block mb-2">Harga Hari Libur *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 55000"
                    value={formData.holiday_price}
                    onChange={(e) => setFormData({...formData, holiday_price: e.target.value})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition-colors"
                  >
                    Simpan Harga
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PRICES TABLE */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 mb-8">
          {prices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💰</div>
              <p className="text-gray-400 text-lg">Tidak ada harga tiket.</p>
              <p className="text-gray-500 text-sm mt-2">Klik "Tambah Harga" untuk menambahkan harga baru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left text-white p-4 font-semibold">Studio</th>
                    <th className="text-left text-white p-4 font-semibold">Hari Biasa</th>
                    <th className="text-left text-white p-4 font-semibold">Weekend</th>
                    <th className="text-left text-white p-4 font-semibold">Hari Libur</th>
                    <th className="text-left text-white p-4 font-semibold">Status</th>
                    <th className="text-left text-white p-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map(price => (
                    <tr key={price.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                      <td className="p-4">
                        <div className="text-white font-medium">
                          {price.studio?.studio || `Studio ${price.studio_id}`}
                        </div>
                        {price.studio?.description && (
                          <div className="text-gray-400 text-sm mt-1">
                            {price.studio.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === price.id ? (
                          <input
                            type="number"
                            value={editData.weekday_price}
                            onChange={(e) => setEditData({...editData, weekday_price: e.target.value})}
                            className="bg-gray-700 text-white p-2 rounded w-28 border border-gray-600 focus:border-yellow-500 focus:outline-none"
                          />
                        ) : (
                          <span className="text-green-400 font-semibold">
                            Rp {parseFloat(price.weekday_price || 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === price.id ? (
                          <input
                            type="number"
                            value={editData.weekend_price}
                            onChange={(e) => setEditData({...editData, weekend_price: e.target.value})}
                            className="bg-gray-700 text-white p-2 rounded w-28 border border-gray-600 focus:border-yellow-500 focus:outline-none"
                          />
                        ) : (
                          <span className="text-yellow-400 font-semibold">
                            Rp {parseFloat(price.weekend_price || 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === price.id ? (
                          <input
                            type="number"
                            value={editData.holiday_price}
                            onChange={(e) => setEditData({...editData, holiday_price: e.target.value})}
                            className="bg-gray-700 text-white p-2 rounded w-28 border border-gray-600 focus:border-yellow-500 focus:outline-none"
                          />
                        ) : (
                          <span className="text-red-400 font-semibold">
                            Rp {parseFloat(price.holiday_price || 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          (price.status === 'Active' || !price.status) ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {price.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        {editingId === price.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(price.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(price)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => toggleStatus(price)}
                              className={`px-3 py-2 rounded text-sm transition-colors ${
                                (price.status === 'Active' || !price.status) 
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {(price.status === 'Active' || !price.status) ? 'Nonaktif' : 'Aktif'}
                            </button>
                            <button
                              onClick={() => handleDelete(price.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
              <span className="mr-2">💡</span> Tips Pricing
            </h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Harga weekend 10-15% lebih tinggi</li>
              <li>• Hari libur nasional +20% dari weekday</li>
              <li>• Studio premium bisa 2x lipat harga regular</li>
              <li>• Pertimbangkan kompetitor sekitar</li>
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
              <span className="mr-2">📊</span> Rata-rata Harga
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Weekday:</span>
                <span className="text-green-400 font-semibold">Rp {averageWeekday.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Weekend:</span>
                <span className="text-yellow-400 font-semibold">Rp {averageWeekend.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Holiday:</span>
                <span className="text-red-400 font-semibold">Rp {averageHoliday.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
              <span className="mr-2">🎯</span> Target Revenue
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Per Hari:</span>
                <span className="text-white font-semibold">Rp 15M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Per Bulan:</span>
                <span className="text-white font-semibold">Rp 450M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Margin:</span>
                <span className="text-green-400 font-semibold">65%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPrices;