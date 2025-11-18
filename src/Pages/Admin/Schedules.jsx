import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [films, setFilms] = useState([]);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    film_id: '',
    studio_id: '',
    show_date: '',
    show_time: '',
    price: '',
  });

  const token = localStorage.getItem('token');
  
  const axiosConfig = {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching data...');
      console.log('🔑 Token:', token ? 'Available' : 'Missing');
      
      const [jadwalRes, filmRes, studioRes] = await Promise.all([
        axios.get('http://localhost:8000/api/v1/jadwals', axiosConfig).catch(err => {
          console.error('❌ Error fetching jadwals:', err.response?.data || err.message);
          return { data: [] };
        }),
        axios.get('http://localhost:8000/api/v1/films', axiosConfig).catch(err => {
          console.error('❌ Error fetching films:', err.response?.data || err.message);
          return { data: [] };
        }),
        axios.get('http://localhost:8000/api/v1/studios', axiosConfig).catch(err => {
          console.error('❌ Error fetching studios:', err.response?.data || err.message);
          return { data: [] };
        })
      ]);

      console.log('📅 Jadwal Response:', jadwalRes.data);
      console.log('🎬 Film Response:', filmRes.data);
      console.log('🎪 Studio Response:', studioRes.data);

      // Handle response structure
      const jadwalsData = Array.isArray(jadwalRes.data) 
        ? jadwalRes.data 
        : jadwalRes.data?.data || [];

      const filmsData = Array.isArray(filmRes.data) 
        ? filmRes.data 
        : filmRes.data?.data || [];

      const studiosData = Array.isArray(studioRes.data) 
        ? studioRes.data 
        : studioRes.data?.data || [];

      setSchedules(jadwalsData);
      setFilms(filmsData);
      setStudios(studiosData);

      console.log(`✅ Loaded: ${jadwalsData.length} jadwals, ${filmsData.length} films, ${studiosData.length} studios`);

    } catch (err) {
      console.error('❌ Error in fetchData:', err);
      setSchedules([]);
      setFilms([]);
      setStudios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validasi form
      if (!formData.film_id || !formData.studio_id || !formData.show_date || !formData.show_time || !formData.price) {
        alert('❌ Semua field harus diisi!');
        return;
      }

      // Format payload dengan benar
      const payload = {
        film_id: parseInt(formData.film_id),
        studio_id: parseInt(formData.studio_id),
        show_date: formData.show_date,
        show_time: formData.show_time + ':00', // Tambahkan seconds untuk format database
        price: parseFloat(formData.price)
      };

      console.log('📤 Sending payload:', payload);
      console.log('🎯 Mode:', editingSchedule ? 'EDIT' : 'ADD');

      let response;
      if (editingSchedule) {
        // EDIT MODE
        response = await axios.put(
          `http://localhost:8000/api/v1/jadwals/${editingSchedule.id}`, 
          payload, 
          axiosConfig
        );
        console.log('✅ Edit response:', response.data);
        alert('✅ Jadwal berhasil diperbarui!');
      } else {
        // ADD MODE
        response = await axios.post(
          'http://localhost:8000/api/v1/jadwals', 
          payload, 
          axiosConfig
        );
        console.log('✅ Add response:', response.data);
        alert('✅ Jadwal berhasil ditambahkan!');
      }
      
      resetForm();
      fetchData(); // Refresh data
    } catch (err) {
      console.error('❌ Error saving schedule:', err);
      console.error('🔍 Error details:', err.response?.data);
      alert('❌ Gagal menyimpan jadwal: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
    
    try {
      await axios.delete(`http://localhost:8000/api/v1/jadwals/${id}`, axiosConfig);
      alert('🗑️ Jadwal berhasil dihapus!');
      fetchData();
    } catch (err) {
      console.error('❌ Error deleting schedule:', err);
      alert('❌ Gagal menghapus jadwal: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (schedule) => {
    console.log('✏️ Editing schedule:', schedule);
    setEditingSchedule(schedule);
    
    // Format date untuk input type="date" (YYYY-MM-DD)
    const showDate = schedule.show_date ? new Date(schedule.show_date).toISOString().split('T')[0] : '';
    
    // Format time untuk input type="time" (HH:MM)
    const showTime = schedule.show_time ? schedule.show_time.substring(0, 5) : '';
    
    setFormData({
      film_id: schedule.film_id?.toString() || '',
      studio_id: schedule.studio_id?.toString() || '',
      show_date: showDate,
      show_time: showTime,
      price: schedule.price?.toString() || '',
    });
    
    setShowForm(true);
  };

  const handleAddNew = () => {
    console.log('➕ Adding new schedule');
    resetForm();
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      film_id: '',
      studio_id: '',
      show_date: '',
      show_time: '',
      price: '',
    });
    setEditingSchedule(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading data jadwal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Jadwal</h1>
            <p className="text-gray-400 mt-2">Atur jadwal tayang film di bioskop</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Tambah Jadwal
          </button>
        </div>

        {/* DEBUG INFO */}
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-400">
            <div>Debug Info:</div>
            <div>Total Films: {films.length} | Total Studios: {studios.length} | Total Schedules: {schedules.length}</div>
            <div>Token: {token ? '✅ Available' : '❌ Missing'}</div>
          </div>
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Film Selection */}
                <div>
                  <label className="text-white text-sm block mb-2">Film *</label>
                  <select
                    value={formData.film_id}
                    onChange={(e) => setFormData({ ...formData, film_id: e.target.value })}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    required
                  >
                    <option value="">Pilih Film</option>
                    {films.map((film) => (
                      <option key={film.id} value={film.id}>
                        {film.title} ({film.duration} menit)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Studio Selection */}
                <div>
                  <label className="text-white text-sm block mb-2">Studio *</label>
                  <select
                    value={formData.studio_id}
                    onChange={(e) => setFormData({ ...formData, studio_id: e.target.value })}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    required
                  >
                    <option value="">Pilih Studio</option>
                    {studios.map((studio) => (
                      <option key={studio.id} value={studio.id}>
                        {studio.studio || studio.name || `Studio ${studio.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm block mb-2">Tanggal *</label>
                    <input
                      type="date"
                      value={formData.show_date}
                      onChange={(e) => setFormData({ ...formData, show_date: e.target.value })}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm block mb-2">Jam *</label>
                    <input
                      type="time"
                      value={formData.show_time}
                      onChange={(e) => setFormData({ ...formData, show_time: e.target.value })}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="text-white text-sm block mb-2">Harga Tiket *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 50000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                    {editingSchedule ? 'Update Jadwal' : 'Simpan Jadwal'}
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

        {/* SCHEDULES TABLE */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <p className="text-gray-400 text-lg">Tidak ada jadwal.</p>
              <p className="text-gray-500 text-sm mt-2">Klik "Tambah Jadwal" untuk menambahkan jadwal baru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left text-white p-4 font-semibold">Film</th>
                    <th className="text-left text-white p-4 font-semibold">Tanggal</th>
                    <th className="text-left text-white p-4 font-semibold">Jam</th>
                    <th className="text-left text-white p-4 font-semibold">Studio</th>
                    <th className="text-left text-white p-4 font-semibold">Harga</th>
                    <th className="text-left text-white p-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                      <td className="p-4">
                        <div className="text-white font-medium">
                          {schedule.film?.title || 'Film tidak ditemukan'}
                        </div>
                        {schedule.film?.genre && (
                          <div className="text-gray-400 text-sm mt-1">
                            {schedule.film.genre}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-gray-300">
                        {formatDate(schedule.show_date)}
                      </td>
                      <td className="p-4 text-gray-300">
                        {formatTime(schedule.show_time)}
                      </td>
                      <td className="p-4 text-gray-300">
                        {schedule.studio?.studio || schedule.studio?.name || `Studio ${schedule.studio_id}`}
                      </td>
                      <td className="p-4">
                        <span className="text-yellow-400 font-semibold">
                          Rp {Number(schedule.price).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
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
      </div>
    </div>
  );
};

export default AdminSchedules;