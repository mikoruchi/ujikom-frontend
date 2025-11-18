import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminStudios = () => {
  const [studios, setStudios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudio, setEditingStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studio: '',
    capacity: '',
    description: 'Regular'
  });

  const token = localStorage.getItem('token');
  
  const axiosConfig = {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const API_STUDIO = 'http://localhost:8000/api/v1/studios';

  useEffect(() => {
    fetchStudios();
  }, []);

  // FETCH STUDIOS FROM DATABASE
  const fetchStudios = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(API_STUDIO, axiosConfig);
      
      // Handle different response structures
      let studiosData = [];
      if (Array.isArray(response.data)) {
        studiosData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        studiosData = response.data.data;
      }
      
      setStudios(studiosData);
      
    } catch (err) {
      console.error('Error fetching studios:', err);
      setStudios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validasi form
      if (!formData.studio.trim()) {
        alert('❌ Nama Studio harus diisi!');
        return;
      }
      
      if (!formData.capacity || formData.capacity < 1) {
        alert('❌ Kapasitas harus lebih dari 0!');
        return;
      }

      const payload = {
        studio: formData.studio.trim(),
        capacity: parseInt(formData.capacity),
        description: formData.description || 'Regular'
      };

      let response;
      if (editingStudio) {
        // EDIT MODE
        response = await axios.put(`${API_STUDIO}/${editingStudio.id}`, payload, axiosConfig);
        alert('✅ Studio berhasil diperbarui!');
      } else {
        // ADD MODE
        response = await axios.post(API_STUDIO, payload, axiosConfig);
        alert('✅ Studio berhasil ditambahkan!');
      }
      
      resetForm();
      await fetchStudios(); // Refresh data
      
    } catch (err) {
      console.error('Error saving studio:', err);
      if (err.response) {
        const errorMessage = err.response.data?.message || 
                            err.response.data?.error || 
                            'Gagal menyimpan studio';
        alert(`❌ ${errorMessage}`);
      } else if (err.request) {
        alert('❌ Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        alert('❌ Terjadi kesalahan: ' + err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus studio ini?')) return;
    
    try {
      await axios.delete(`${API_STUDIO}/${id}`, axiosConfig);
      alert('🗑️ Studio berhasil dihapus!');
      await fetchStudios();
    } catch (err) {
      console.error('Error deleting studio:', err);
      if (err.response) {
        alert('❌ Gagal menghapus studio: ' + (err.response.data?.message || err.message));
      } else {
        alert('❌ Gagal menghapus studio: ' + err.message);
      }
    }
  };

  const handleEdit = (studio) => {
    setEditingStudio(studio);
    
    setFormData({
      studio: studio.studio || '',
      capacity: studio.capacity?.toString() || '',
      description: studio.description || 'Regular'
    });
    
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingStudio(null);
    setFormData({
      studio: '',
      capacity: '',
      description: 'Regular'
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      studio: '',
      capacity: '',
      description: 'Regular'
    });
    setEditingStudio(null);
    setShowForm(false);
  };

  // STATISTICS CALCULATION
  const totalStudios = studios.length;
  const totalCapacity = studios.reduce((sum, s) => sum + (s.capacity || 0), 0);
  const averageCapacity = totalStudios > 0 ? Math.round(totalCapacity / totalStudios) : 0;
  const regularStudios = studios.filter(s => !s.description || s.description === 'Regular').length;
  const premiumStudios = studios.filter(s => s.description && s.description !== 'Regular').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading data studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Studio</h1>
            <p className="text-gray-400 mt-2">Manajemen studio bioskop</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Tambah Studio
          </button>
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingStudio ? 'Edit Studio' : 'Tambah Studio Baru'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama Studio */}
                <div>
                  <label className="text-white text-sm block mb-2">Nama Studio *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Studio 1, Studio A, etc."
                    value={formData.studio}
                    onChange={(e) => setFormData({...formData, studio: e.target.value})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Kapasitas */}
                <div>
                  <label className="text-white text-sm block mb-2">Kapasitas Kursi *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 100"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    required
                    min="1"
                    max="1000"
                  />
                </div>

                {/* Tipe/Description */}
                <div>
                  <label className="text-white text-sm block mb-2">Tipe Studio</label>
                  <select
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Dolby Atmos">Dolby Atmos</option>
                    <option value="4DX">4DX</option>
                    <option value="IMAX">IMAX</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition-colors"
                  >
                    {editingStudio ? 'Update Studio' : 'Simpan Studio'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STUDIOS TABLE */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 mb-8">
          {studios.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎭</div>
              <p className="text-gray-400 text-lg">Tidak ada studio.</p>
              <p className="text-gray-500 text-sm mt-2">Klik "Tambah Studio" untuk menambahkan studio baru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left text-white p-4 font-semibold">Nama Studio</th>
                    <th className="text-left text-white p-4 font-semibold">Kapasitas</th>
                    <th className="text-left text-white p-4 font-semibold">Tipe</th>
                    <th className="text-left text-white p-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {studios.map(studio => (
                    <tr key={studio.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                      <td className="p-4 text-white font-medium">{studio.studio}</td>
                      <td className="p-4 text-gray-300">{studio.capacity} kursi</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          studio.description === 'Regular' ? 'bg-blue-500 text-white' :
                          studio.description === 'Dolby Atmos' ? 'bg-purple-500 text-white' :
                          studio.description === '4DX' ? 'bg-red-500 text-white' :
                          studio.description === 'IMAX' ? 'bg-green-500 text-white' :
                          studio.description === 'Premium' ? 'bg-yellow-500 text-black' :
                          studio.description === 'VIP' ? 'bg-pink-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {studio.description || 'Regular'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(studio)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(studio.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
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
          {/* Statistik Studio */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
              <span className="mr-2">📊</span> Statistik Studio
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Studio:</span>
                <span className="text-white font-semibold">{totalStudios}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Kapasitas Total:</span>
                <span className="text-green-400 font-semibold">{totalCapacity} kursi</span>
              </div>
            </div>
          </div>

          {/* Tipe Studio */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
              <span className="mr-2">🎭</span> Tipe Studio
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Regular:</span>
                <span className="text-blue-400 font-semibold">{regularStudios}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Premium:</span>
                <span className="text-purple-400 font-semibold">{premiumStudios}</span>
              </div>
            </div>
          </div>

          {/* Total Kapasitas */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
              <span className="mr-2">🪑</span> Kapasitas Rata-rata
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rata-rata per Studio:</span>
                <span className="text-white font-semibold">{averageCapacity} kursi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudios;