import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminSeats = () => {
  const [selectedStudio, setSelectedStudio] = useState('');
  const [studios, setStudios] = useState([]);
  const [seats, setSeats] = useState([]);
  const [currentStudio, setCurrentStudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    maintenance: 0,
    regular: 0,
    vip: 0,
    capacity_percentage: 0
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || 
           sessionStorage.getItem('token');
  };

  // Create axios instance with auth
  const createApiInstance = () => {
    const token = getAuthToken();
    
    const instance = axios.create({
      baseURL: 'http://localhost:8000/api/v1',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return instance;
  };

  // Fetch studios
  const fetchStudios = async () => {
    try {
      const api = createApiInstance();
      const response = await api.get('/studios');
      
      if (response.data.success) {
        setStudios(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedStudio(response.data.data[0].id.toString());
        }
      } else {
        alert('Gagal mengambil data studio: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching studios:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  // Fetch seats for selected studio
  const fetchSeats = async (studioId) => {
    try {
      setLoading(true);
      const api = createApiInstance();
      const response = await api.get(`/seats/studio/${studioId}`);
      
      if (response.data.success) {
        setSeats(response.data.data.seats);
        setCurrentStudio(response.data.data.studio);
        fetchStatistics(studioId);
      } else {
        alert('Gagal mengambil data kursi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      if (error.response?.status === 404) {
        setSeats([]);
        setCurrentStudio(studios.find(s => s.id.toString() === studioId));
      } else {
        alert('Gagal mengambil data kursi: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async (studioId) => {
    try {
      const api = createApiInstance();
      const response = await api.get(`/seats/statistics/${studioId}`);
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Generate seats for studio
  const generateSeats = async (studioId) => {
    try {
      setLoading(true);
      const api = createApiInstance();
      const response = await api.post(`/seats/generate/${studioId}`);
      
      if (response.data.success) {
        alert(response.data.message);
        fetchSeats(studioId);
      } else {
        alert('Gagal generate kursi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error generating seats:', error);
      alert('Gagal generate kursi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Regenerate seats
  const regenerateSeats = async (studioId) => {
    try {
      if (!window.confirm('Apakah Anda yakin ingin menggenerate ulang semua kursi? Semua kursi yang ada akan dihapus dan dibuat baru.')) {
        return;
      }

      setLoading(true);
      const api = createApiInstance();
      const response = await api.post(`/seats/regenerate/${studioId}`);
      
      if (response.data.success) {
        alert(response.data.message);
        fetchSeats(studioId);
      } else {
        alert('Gagal regenerate kursi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error regenerating seats:', error);
      alert('Gagal regenerate kursi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Update seat status
  const updateSeatStatus = async (seatId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'available' ? 'maintenance' : 'available';
      const api = createApiInstance();
      
      const response = await api.put(`/seats/${seatId}/status`, {
        status: nextStatus
      });

      if (response.data.success) {
        setSeats(prevSeats => 
          prevSeats.map(seat => 
            seat.id === seatId ? { ...seat, status: nextStatus } : seat
          )
        );
        fetchStatistics(selectedStudio);
      }
    } catch (error) {
      console.error('Error updating seat status:', error);
      alert('Gagal mengubah status kursi: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update seat type
  const updateSeatType = async (seatId, currentType) => {
    try {
      const nextType = currentType === 'regular' ? 'vip' : 'regular';
      const api = createApiInstance();
      
      const response = await api.put(`/seats/${seatId}/type`, {
        kursi_type: nextType
      });

      if (response.data.success) {
        setSeats(prevSeats => 
          prevSeats.map(seat => 
            seat.id === seatId ? { ...seat, kursi_type: nextType } : seat
          )
        );
        fetchStatistics(selectedStudio);
      }
    } catch (error) {
      console.error('Error updating seat type:', error);
      alert('Gagal mengubah tipe kursi: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle seat click - sekarang menggunakan mouse event untuk membedakan
  const handleSeatClick = (seat, event) => {
    // Klik kiri (event.button === 0) untuk status
    // Klik kanan (event.button === 2) untuk tipe
    if (event.button === 0) { // Klik kiri
      updateSeatStatus(seat.id, seat.status);
    } else if (event.button === 2) { // Klik kanan
      event.preventDefault(); // Mencegah menu konteks browser muncul
      updateSeatType(seat.id, seat.kursi_type);
    }
  };

  // Bulk update seats - PERBAIKAN: Tambahkan action untuk semua kursi jadi VIP
  const bulkUpdateSeats = async (action, rows = []) => {
    try {
      // Konfirmasi untuk aksi tertentu
      const confirmMessages = {
        'reset_all': 'Apakah Anda yakin ingin mereset semua kursi ke default?',
        'available_mode': 'Apakah Anda yakin ingin mengatur semua kursi menjadi available?',
        'maintenance_mode': 'Apakah Anda yakin ingin mengatur semua kursi menjadi maintenance?',
        'set_all_vip': 'Apakah Anda yakin ingin mengatur SEMUA kursi menjadi VIP?',
        'set_all_regular': 'Apakah Anda yakin ingin mengatur SEMUA kursi menjadi Regular?'
      };

      if (confirmMessages[action]) {
        if (!window.confirm(confirmMessages[action])) {
          return;
        }
      }

      const api = createApiInstance();
      
      const response = await api.post('/seats/bulk-update', {
        studio_id: selectedStudio,
        action: action,
        rows: rows
      });

      if (response.data.success) {
        alert(response.data.message);
        fetchSeats(selectedStudio);
      } else {
        alert('Gagal melakukan aksi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
      alert('Gagal melakukan aksi: ' + (error.response?.data?.message || error.message));
    }
  };

  const getSeatColor = (seat) => {
    // Warna berdasarkan status (available/maintenance)
    if (seat.status === 'maintenance') {
      return 'bg-red-500 hover:bg-red-600';
    }
    
    // Warna berdasarkan tipe (regular/vip)
    if (seat.kursi_type === 'vip') {
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700';
    }
    
    return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
  };

  // Group seats by row untuk display yang lebih baik
  const groupSeatsByRow = () => {
    const grouped = {};
    seats.forEach(seat => {
      const row = seat.kursi_no.charAt(0);
      if (!grouped[row]) {
        grouped[row] = [];
      }
      grouped[row].push(seat);
    });

    // Urutkan kursi dalam setiap baris berdasarkan nomor
    Object.keys(grouped).forEach(row => {
      grouped[row].sort((a, b) => {
        const numA = parseInt(a.kursi_no.slice(1));
        const numB = parseInt(b.kursi_no.slice(1));
        return numA - numB;
      });
    });

    return grouped;
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  useEffect(() => {
    if (selectedStudio) {
      fetchSeats(selectedStudio);
    }
  }, [selectedStudio]);

  const groupedSeats = groupSeatsByRow();
  const rows = Object.keys(groupedSeats).sort();
  const seatsPerRow = rows.length > 0 ? groupedSeats[rows[0]].length : 0;

  // Cek apakah studio saat ini memiliki 150 kursi
  const is150CapacityStudio = currentStudio && currentStudio.capacity === 150;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">🎬 Kelola Kursi Studio</h1>
          <div className="flex gap-4 items-center">
            <select
              value={selectedStudio}
              onChange={(e) => setSelectedStudio(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 min-w-[200px]"
              disabled={studios.length === 0}
            >
              <option value="">Pilih Studio</option>
              {studios.map(studio => (
                <option key={studio.id} value={studio.id}>
                  Studio {studio.studio} - {studio.capacity} kursi
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Action Buttons - MENGGANTI PETUNJUK INTERAKSI */}
        <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Column 1: Status Actions */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Status Kursi</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => bulkUpdateSeats('available_mode')}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>✅</span>
                  <span>Available All</span>
                </button>
                <button 
                  onClick={() => bulkUpdateSeats('maintenance_mode')}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>🔧</span>
                  <span>Maintenance All</span>
                </button>
              </div>
            </div>

            {/* Column 2: Type Actions */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Tipe Kursi</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => bulkUpdateSeats('set_all_vip')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>⭐</span>
                  <span>All VIP</span>
                </button>
                <button 
                  onClick={() => bulkUpdateSeats('set_all_regular')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>🔵</span>
                  <span>All Regular</span>
                </button>
              </div>
            </div>

            {/* Column 3: Row Actions */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Aksi Baris</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => bulkUpdateSeats('set_vip_rows', ['A', 'B'])}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>VIP</span>
                  <span>Baris A-B</span>
                </button>
                <button 
                  onClick={() => bulkUpdateSeats('set_regular_rows', ['A', 'B'])}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>Reg</span>
                  <span>Baris A-B</span>
                </button>
              </div>
            </div>

            {/* Column 4: System Actions */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Sistem</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => bulkUpdateSeats('reset_all')}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  <span>Reset All</span>
                </button>
                <button 
                  onClick={() => regenerateSeats(selectedStudio)}
                  className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                  disabled={!selectedStudio}
                >
                  <span>⚡</span>
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Instructions */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Klik Kiri: Ubah Status (Available/Maintenance)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Klik Kanan: Ubah Tipe (Regular/VIP)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Notice untuk studio 150 kursi */}
        {is150CapacityStudio && (
          <div className="mb-4 bg-yellow-900 border border-yellow-600 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">⚠️</span>
              <div>
                <p className="text-yellow-200 text-sm">
                  <span className="font-semibold">Studio 150 Kursi:</span> 10 kursi terakhir otomatis diatur sebagai maintenance.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-white text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4">Memuat data kursi...</p>
          </div>
        )}

        {!loading && currentStudio && seats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Seat Map */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Studio {currentStudio.studio} - {currentStudio.description}
                    </h2>
                    {is150CapacityStudio && (
                      <p className="text-yellow-400 text-sm mt-1">150 kursi • 10 kursi maintenance</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded">
                      <span className="text-green-400 text-sm font-medium">{stats.available} Available</span>
                    </div>
                    <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded">
                      <span className="text-yellow-400 text-sm font-medium">{stats.vip} VIP</span>
                    </div>
                    <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded">
                      <span className="text-red-400 text-sm font-medium">{stats.maintenance} Maintenance</span>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 py-3 px-12 rounded-t-2xl inline-block font-semibold border border-gray-600">
                    🎬 L A Y A R 🎬
                  </div>
                </div>

                <div className="space-y-2 max-w-4xl mx-auto">
                  {rows.map(row => (
                    <div key={row} className="flex justify-center gap-1">
                      <div className="w-8 flex items-center justify-center text-white font-semibold">
                        {row}
                      </div>
                      {groupedSeats[row].map(seat => (
                        <button
                          key={seat.id}
                          onClick={(e) => handleSeatClick(seat, e)}
                          onContextMenu={(e) => handleSeatClick(seat, e)}
                          className={`
                            w-8 h-8 rounded text-xs font-semibold transition-all duration-200 
                            hover:scale-110 hover:shadow-lg hover:z-10
                            ${getSeatColor(seat)}
                            ${seat.status === 'maintenance' ? 'shadow-lg shadow-red-500/20' : ''}
                            ${seat.kursi_type === 'vip' ? 'shadow-lg shadow-yellow-500/20' : ''}
                          `}
                          title={`Kursi ${seat.kursi_no}
Status: ${seat.status === 'available' ? '✅ Available' : '🔧 Maintenance'}
Tipe: ${seat.kursi_type === 'vip' ? '⭐ VIP' : '🔵 Regular'}
Klik kiri: Ubah status
Klik kanan: Ubah tipe`}
                        >
                          {seat.kursi_no.slice(1)}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                    <span className="text-gray-300 text-sm">Regular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded"></div>
                    <span className="text-gray-300 text-sm">VIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-300 text-sm">Maintenance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Stats & Info */}
            <div className="space-y-6">
              {/* Statistics Card */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                  <span>📊</span> Statistik
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Total Kursi</div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Available</span>
                        <span className="text-green-400 font-semibold">{stats.available}</span>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full rounded-full" 
                          style={{ width: `${(stats.available / stats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">VIP</span>
                        <span className="text-yellow-400 font-semibold">{stats.vip}</span>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-yellow-500 h-full rounded-full" 
                          style={{ width: `${(stats.vip / stats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Maintenance</span>
                        <span className="text-red-400 font-semibold">{stats.maintenance}</span>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-red-500 h-full rounded-full" 
                          style={{ width: `${(stats.maintenance / stats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Kapasitas</span>
                      <span className="text-white font-bold">{stats.capacity_percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Studio Info Card */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                  <span>ℹ️</span> Info Studio
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Nama Studio</div>
                    <div className="text-white font-medium">Studio {currentStudio?.studio}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg">
                      <div className="text-gray-400 text-xs mb-1">Kapasitas</div>
                      <div className="text-white font-medium">{currentStudio?.capacity} kursi</div>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg">
                      <div className="text-gray-400 text-xs mb-1">Baris</div>
                      <div className="text-white font-medium">{rows.length}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Deskripsi</div>
                    <div className="text-white font-medium">{currentStudio?.description}</div>
                  </div>
                  
                  {is150CapacityStudio && (
                    <div className="bg-yellow-900/20 border border-yellow-700/50 p-3 rounded-lg">
                      <div className="text-yellow-400 text-xs mb-1">Kursi Maintenance</div>
                      <div className="text-yellow-300 font-medium">10 kursi terakhir</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Button (if no seats) */}
              {seats.length === 0 && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4">🎬 Buat Kursi</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Studio ini belum memiliki konfigurasi kursi. Klik tombol di bawah untuk membuat kursi secara otomatis.
                  </p>
                  <button
                    onClick={() => generateSeats(selectedStudio)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-3 rounded-lg font-bold text-lg transition-all shadow-lg shadow-yellow-500/20"
                    disabled={!selectedStudio}
                  >
                    🪑 Generate Kursi
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && currentStudio && seats.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-8 bg-gray-800 rounded-2xl border border-gray-700">
              <div className="text-yellow-400 text-7xl mb-6">🎬</div>
              <h3 className="text-2xl font-bold text-white mb-3">Studio Belum Memiliki Kursi</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Studio ini belum memiliki konfigurasi kursi. Klik tombol di bawah untuk membuat kursi secara otomatis.
              </p>
              <button
                onClick={() => generateSeats(selectedStudio)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg shadow-yellow-500/20"
                disabled={!selectedStudio}
              >
                🪑 Generate Kursi Otomatis
              </button>
              <p className="text-gray-500 text-sm mt-4">
                Semua kursi akan dibuat dengan tipe default <span className="text-blue-400">Regular</span>
              </p>
            </div>
          </div>
        )}

        {!loading && studios.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-8 bg-gray-800 rounded-2xl border border-gray-700">
              <div className="text-red-400 text-7xl mb-6">❌</div>
              <h3 className="text-2xl font-bold text-white mb-3">Tidak Ada Studio</h3>
              <p className="text-gray-400 mb-6">Belum ada studio yang terdaftar di sistem.</p>
              <button
                onClick={fetchStudios}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                🔄 Muat Ulang Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSeats;