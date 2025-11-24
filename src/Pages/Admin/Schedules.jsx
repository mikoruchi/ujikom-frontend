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
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const validateForm = () => {
    const errors = {};
    
    console.log('🔄 Validating form data:', formData);
    
    if (!formData.film_id || formData.film_id === '' || formData.film_id === '0') {
      errors.film_id = 'Film harus dipilih';
      console.log('❌ film_id validation failed - value:', formData.film_id);
    } else {
      console.log('✅ film_id validation passed - value:', formData.film_id);
    }
    
    if (!formData.studio_id || formData.studio_id === '' || formData.studio_id === '0') {
      errors.studio_id = 'Studio harus dipilih';
      console.log('❌ studio_id validation failed - value:', formData.studio_id);
    } else {
      console.log('✅ studio_id validation passed - value:', formData.studio_id);
    }
    
    if (!formData.show_date) {
      errors.show_date = 'Tanggal harus diisi';
      console.log('❌ show_date validation failed - value:', formData.show_date);
    } else {
      console.log('✅ show_date validation passed - value:', formData.show_date);
    }
    
    if (!formData.show_time) {
      errors.show_time = 'Jam harus diisi';
      console.log('❌ show_time validation failed - value:', formData.show_time);
    } else {
      console.log('✅ show_time validation passed - value:', formData.show_time);
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Harga harus lebih dari 0';
      console.log('❌ price validation failed - value:', formData.price);
    } else {
      console.log('✅ price validation passed - value:', formData.price);
    }

    console.log('📋 Validation errors:', errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    console.log('🎯 SUBMIT TRIGGERED');
    console.log('🔍 FORM DATA BEFORE VALIDATION:', formData);
    console.log('🎬 Available films:', films.map(f => ({id: f.id, title: f.title})));
    console.log('🎪 Available studios:', studios.map(s => ({id: s.id, name: s.studio || s.name})));
    
    // Validasi form
    if (!validateForm()) {
      alert('❌ Mohon lengkapi semua field yang wajib diisi!');
      setSubmitLoading(false);
      return;
    }
    
    // Validasi tambahan untuk memastikan data tersedia
    if (films.length === 0) {
      alert('❌ Tidak ada film tersedia. Pastikan data film sudah dimuat.');
      setSubmitLoading(false);
      return;
    }
    
    if (studios.length === 0) {
      alert('❌ Tidak ada studio tersedia. Pastikan data studio sudah dimuat.');
      setSubmitLoading(false);
      return;
    }

    try {
      // Format payload dengan benar - PASTIKAN film_id termasuk
      const payload = {
        film_id: parseInt(formData.film_id),
        studio_id: parseInt(formData.studio_id),
        show_date: formData.show_date,
        show_time: formData.show_time + ':00',
        price: parseFloat(formData.price)
      };
      
      // Validasi ulang payload sebelum dikirim
      if (!payload.film_id || isNaN(payload.film_id)) {
        alert('❌ Film ID tidak valid. Silakan pilih film terlebih dahulu.');
        setSubmitLoading(false);
        return;
      }
      
      if (!payload.studio_id || isNaN(payload.studio_id)) {
        alert('❌ Studio ID tidak valid. Silakan pilih studio terlebih dahulu.');
        setSubmitLoading(false);
        return;
      }

      console.log('📤 FINAL PAYLOAD TO SEND:', payload);
      console.log('🎯 Mode:', editingSchedule ? 'EDIT' : 'ADD');

      let response;
      if (editingSchedule) {
        // EDIT MODE
        console.log('✏️ Editing schedule ID:', editingSchedule.id);
        response = await axios.put(
          `http://localhost:8000/api/v1/jadwals/${editingSchedule.id}`, 
          payload, 
          axiosConfig
        );
        console.log('✅ Edit response:', response.data);
        alert('✅ Jadwal berhasil diperbarui!');
      } else {
        // ADD MODE
        console.log('➕ Adding new schedule');
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
      console.error('🔍 Error response:', err.response);
      console.error('🔍 Error details:', err.response?.data);
      console.error('🔍 Error message:', err.message);
      
      // Tampilkan error yang lebih spesifik
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message;
      alert('❌ Gagal menyimpan jadwal: ' + errorMessage);
    } finally {
      setSubmitLoading(false);
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
    setFormErrors({});
    
    const showDate = schedule.show_date ? schedule.show_date.split('T')[0] : '';
    const showTime = schedule.show_time ? schedule.show_time.substring(0,5) : '';
    
    const newFormData = {
      film_id: schedule.film_id?.toString() || '',
      studio_id: schedule.studio_id?.toString() || '',
      show_date: schedule.show_date ? showDate : '',
      show_time: schedule.show_time ? showTime : '',
      price: schedule.price?.toString() || '',
    };
    
    console.log('📝 Setting form data for edit:', newFormData);
    setFormData(newFormData);
    setShowForm(true);
  };

  const handleAddNew = () => {
    console.log('➕ Adding new schedule');
    setFormErrors({});
    resetForm();
    setShowForm(true);
  };

  const resetForm = () => {
    const emptyForm = {
      film_id: '',
      studio_id: '',
      show_date: '',
      show_time: '',
      price: '',
    };
    console.log('🔄 Resetting form to:', emptyForm);
    setFormData(emptyForm);
    setFormErrors({});
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

  const handleFilmChange = (e) => {
    const value = e.target.value;
    console.log('🎬 Film changed:', value);
    setFormData({ ...formData, film_id: value });
  };

  const handleStudioChange = (e) => {
    const value = e.target.value;
    console.log('🎪 Studio changed:', value);
    setFormData({ ...formData, studio_id: value });
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
            <div className="text-yellow-400 font-semibold mb-2">Debug Information:</div>
            <div>Total Films: <span className="text-white">{films.length}</span></div>
            <div>Total Studios: <span className="text-white">{studios.length}</span></div>
            <div>Total Schedules: <span className="text-white">{schedules.length}</span></div>
            <div>Token: <span className={token ? 'text-green-400' : 'text-red-400'}>
              {token ? '✅ Available' : '❌ Missing'}
            </span></div>
            <div className="mt-2 text-xs">
              Film IDs: {films.map(f => f.id).join(', ')}
            </div>
            <div className="text-xs">
              Studio IDs: {studios.map(s => s.id).join(', ')}
            </div>
          </div>
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
              </h2>
              
              {/* DEBUG INFO IN FORM */}
              <div className="mb-4 p-3 bg-gray-700 rounded text-xs">
                <div className="text-yellow-400 font-semibold mb-1">Form Debug Info:</div>
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-gray-400">film_id:</span>
                  <span className={formData.film_id ? 'text-green-400' : 'text-red-400'}>
                    {formData.film_id || 'EMPTY'}
                  </span>
                  <span className="text-gray-400">studio_id:</span>
                  <span className={formData.studio_id ? 'text-green-400' : 'text-red-400'}>
                    {formData.studio_id || 'EMPTY'}
                  </span>
                  <span className="text-gray-400">show_date:</span>
                  <span className={formData.show_date ? 'text-green-400' : 'text-red-400'}>
                    {formData.show_date || 'EMPTY'}
                  </span>
                  <span className="text-gray-400">show_time:</span>
                  <span className={formData.show_time ? 'text-green-400' : 'text-red-400'}>
                    {formData.show_time || 'EMPTY'}
                  </span>
                  <span className="text-gray-400">price:</span>
                  <span className={formData.price ? 'text-green-400' : 'text-red-400'}>
                    {formData.price || 'EMPTY'}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Film Selection */}
                <div>
                  <label className="text-white text-sm block mb-2">Film *</label>
                  <select
                    value={formData.film_id}
                    onChange={handleFilmChange}
                    className={`w-full bg-gray-700 text-white p-3 rounded-lg border focus:outline-none ${
                      formErrors.film_id ? 'border-red-500' : 'border-gray-600 focus:border-yellow-500'
                    }`}
                    required
                    disabled={films.length === 0}
                  >
                    <option value="">-- Pilih Film --</option>
                    {films.map((film) => (
                      <option key={film.id} value={film.id}>
                        {film.title} ({film.duration} menit) - {film.genre}
                      </option>
                    ))}
                  </select>
                  {formErrors.film_id && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.film_id}</p>
                  )}
                  {films.length === 0 && (
                    <p className="text-red-400 text-sm mt-1">❌ Tidak ada film tersedia. Pastikan API films bekerja.</p>
                  )}
                </div>

                {/* Studio Selection */}
                <div>
                  <label className="text-white text-sm block mb-2">Studio *</label>
                  <select
                    value={formData.studio_id}
                    onChange={handleStudioChange}
                    className={`w-full bg-gray-700 text-white p-3 rounded-lg border focus:outline-none ${
                      formErrors.studio_id ? 'border-red-500' : 'border-gray-600 focus:border-yellow-500'
                    }`}
                    required
                    disabled={studios.length === 0}
                  >
                    <option value="">-- Pilih Studio --</option>
                    {studios.map((studio) => (
                      <option key={studio.id} value={studio.id}>
                        {studio.studio || studio.name || `Studio ${studio.id}`}
                        {studio.description ? ` - ${studio.description}` : ''}
                      </option>
                    ))}
                  </select>
                  {formErrors.studio_id && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.studio_id}</p>
                  )}
                  {studios.length === 0 && (
                    <p className="text-red-400 text-sm mt-1">❌ Tidak ada studio tersedia. Pastikan API studios bekerja.</p>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm block mb-2">Tanggal *</label>
                    <input
                      type="date"
                      value={formData.show_date}
                      onChange={(e) => setFormData({ ...formData, show_date: e.target.value })}
                      className={`w-full bg-gray-700 text-white p-3 rounded-lg border focus:outline-none ${
                        formErrors.show_date ? 'border-red-500' : 'border-gray-600 focus:border-yellow-500'
                      }`}
                      required
                    />
                    {formErrors.show_date && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.show_date}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-white text-sm block mb-2">Jam *</label>
                    <input
                      type="time"
                      value={formData.show_time}
                      onChange={(e) => setFormData({ ...formData, show_time: e.target.value })}
                      className={`w-full bg-gray-700 text-white p-3 rounded-lg border focus:outline-none ${
                        formErrors.show_time ? 'border-red-500' : 'border-gray-600 focus:border-yellow-500'
                      }`}
                      required
                    />
                    {formErrors.show_time && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.show_time}</p>
                    )}
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
                    className={`w-full bg-gray-700 text-white p-3 rounded-lg border focus:outline-none ${
                      formErrors.price ? 'border-red-500' : 'border-gray-600 focus:border-yellow-500'
                    }`}
                    required
                    min="0"
                    step="1000"
                  />
                  {formErrors.price && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.price}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={submitLoading || films.length === 0 || studios.length === 0}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-700 text-black py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    {submitLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      editingSchedule ? 'Update Jadwal' : 'Simpan Jadwal'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitLoading}
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
                        <div className="text-gray-500 text-xs mt-1">
                          Film ID: {schedule.film_id} | Studio ID: {schedule.studio_id}
                        </div>
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