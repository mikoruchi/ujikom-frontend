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
    vip: 0,
    maintenance: 0,
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

  // Generate seats for studio dengan penanganan khusus untuk 150 kursi
  const generateSeats = async (studioId) => {
    try {
      setLoading(true);
      const api = createApiInstance();
      const response = await api.post(`/seats/generate/${studioId}`);
      
      if (response.data.success) {
        // Jika studio memiliki 150 kursi, atur 10 kursi terakhir menjadi maintenance
        const studio = studios.find(s => s.id.toString() === studioId);
        if (studio && studio.capacity === 150) {
          await adjustLastTenSeats(studioId);
        }
        
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

  // Fungsi untuk mengatur 10 kursi terakhir menjadi maintenance
  const adjustLastTenSeats = async (studioId) => {
    try {
      const api = createApiInstance();
      
      // Ambil semua kursi untuk studio ini
      const seatsResponse = await api.get(`/seats/studio/${studioId}`);
      if (seatsResponse.data.success) {
        const allSeats = seatsResponse.data.data.seats;
        
        // Urutkan kursi berdasarkan nomor untuk memastikan urutan yang benar
        const sortedSeats = allSeats.sort((a, b) => {
          const rowA = a.kursi_no.charAt(0);
          const rowB = b.kursi_no.charAt(0);
          const numA = parseInt(a.kursi_no.slice(1));
          const numB = parseInt(b.kursi_no.slice(1));
          
          if (rowA !== rowB) {
            return rowA.localeCompare(rowB);
          }
          return numA - numB;
        });
        
        // Ambil 10 kursi terakhir
        const lastTenSeats = sortedSeats.slice(-10);
        
        // Update status 10 kursi terakhir menjadi maintenance
        for (const seat of lastTenSeats) {
          await api.put(`/seats/${seat.id}/status`, {
            status: 'maintenance'
          });
        }
        
        console.log('10 kursi terakhir diatur menjadi maintenance');
      }
    } catch (error) {
      console.error('Error adjusting last ten seats:', error);
    }
  };

  // Regenerate seats dengan penanganan khusus untuk 150 kursi
  const regenerateSeats = async (studioId) => {
    try {
      if (!window.confirm('Apakah Anda yakin ingin menggenerate ulang semua kursi? Semua kursi yang ada akan dihapus dan dibuat baru.')) {
        return;
      }

      setLoading(true);
      const api = createApiInstance();
      const response = await api.post(`/seats/regenerate/${studioId}`);
      
      if (response.data.success) {
        // Jika studio memiliki 150 kursi, atur 10 kursi terakhir menjadi maintenance
        const studio = studios.find(s => s.id.toString() === studioId);
        if (studio && studio.capacity === 150) {
          await adjustLastTenSeats(studioId);
        }
        
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
      const nextStatus = getNextStatus(currentStatus);
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

  // Bulk update seats
  const bulkUpdateSeats = async (action, rows = []) => {
    try {
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

  // Fungsi khusus untuk mengatur 10 kursi terakhir menjadi maintenance
  const setLastTenToMaintenance = async () => {
    try {
      if (!window.confirm('Apakah Anda yakin ingin mengatur 10 kursi terakhir menjadi maintenance?')) {
        return;
      }

      setLoading(true);
      await adjustLastTenSeats(selectedStudio);
      alert('10 kursi terakhir berhasil diatur menjadi maintenance');
      fetchSeats(selectedStudio);
    } catch (error) {
      console.error('Error setting last ten to maintenance:', error);
      alert('Gagal mengatur kursi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'available': return 'maintenance';
      case 'maintenance': return 'vip';
      case 'vip': return 'available';
      default: return 'available';
    }
  };

  const getSeatColor = (status) => {
    switch (status) {
      case 'maintenance': return 'bg-red-500 hover:bg-red-600';
      case 'vip': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      default: return 'bg-green-500 hover:bg-green-600';
    }
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Kelola Kursi Bioskop</h1>
          <div className="flex gap-4">
            <select
              value={selectedStudio}
              onChange={(e) => setSelectedStudio(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
              disabled={studios.length === 0}
            >
              <option value="">Pilih Studio</option>
              {studios.map(studio => (
                <option key={studio.id} value={studio.id}>
                  {studio.studio} - {studio.capacity} kursi
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Special Notice untuk studio 150 kursi */}
        {is150CapacityStudio && (
          <div className="bg-yellow-900 border border-yellow-600 p-4 rounded-lg mb-4">
            <div className="flex items-center">
              <span className="text-yellow-400 text-xl mr-2">⚠️</span>
              <div>
                <h3 className="text-yellow-400 font-semibold">Studio Khusus 150 Kursi</h3>
                <p className="text-yellow-200 text-sm">
                  Studio ini memiliki 150 kursi (20 kursi per baris). 10 kursi terakhir akan otomatis diatur sebagai maintenance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h3 className="text-yellow-400 font-semibold mb-2">Info Sistem:</h3>
          <p className="text-white text-sm">Jumlah Studio: {studios.length}</p>
          <p className="text-white text-sm">Studio Terpilih: {selectedStudio}</p>
          <p className="text-white text-sm">Jumlah Kursi: {seats.length}</p>
          <p className="text-white text-sm">Kapasitas Studio: {currentStudio?.capacity}</p>
          <p className="text-white text-sm">Status: {loading ? 'Loading...' : 'Siap'}</p>
        </div>

        {loading && (
          <div className="text-white text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4">Memuat data kursi...</p>
          </div>
        )}

        {!loading && currentStudio && seats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Seat Map */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {currentStudio.studio} - {currentStudio.description}
                    {is150CapacityStudio && (
                      <span className="ml-2 text-yellow-400 text-sm">(150 kursi - 10 maintenance)</span>
                    )}
                  </h2>
                  <div className="flex gap-2">
                    {is150CapacityStudio && (
                      <button
                        onClick={setLastTenToMaintenance}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        🔧 Atur 10 Maintenance
                      </button>
                    )}
                    <button
                      onClick={() => regenerateSeats(selectedStudio)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      🔄 Generate Ulang
                    </button>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-2 px-8 rounded-t-3xl inline-block font-semibold">
                    LAYAR
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
                          onClick={() => updateSeatStatus(seat.id, seat.status)}
                          className={`
                            w-8 h-8 rounded text-xs font-semibold transition-all hover:scale-110
                            ${getSeatColor(seat.status)}
                            ${is150CapacityStudio && seat.status === 'maintenance' ? 'border-2 border-red-300' : ''}
                          `}
                          title={`${seat.kursi_no} - ${seat.status} (${seat.kursi_type})`}
                        >
                          {seat.kursi_no.slice(1)}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-300 text-sm">Normal ({stats.available})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300 text-sm">VIP ({stats.vip})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-300 text-sm">Maintenance ({stats.maintenance})</span>
                  </div>
                </div>

                {/* Info khusus untuk 150 kursi */}
                {is150CapacityStudio && (
                  <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                    <p className="text-yellow-400 text-sm text-center">
                      💡 <strong>Studio 150 Kursi:</strong> 10 kursi terakhir (baris terakhir) diatur sebagai maintenance
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Controls & Stats */}
            <div className="space-y-6">
              {/* Studio Stats */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">📊 Statistik Kursi</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Kursi:</span>
                    <span className="text-white font-semibold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Normal:</span>
                    <span className="text-green-400">{stats.available}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">VIP:</span>
                    <span className="text-yellow-400">{stats.vip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Maintenance:</span>
                    <span className="text-red-400">{stats.maintenance}</span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kapasitas:</span>
                    <span className="text-white">{stats.capacity_percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">⚡ Aksi Cepat</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => bulkUpdateSeats('reset_all')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm"
                  >
                    Reset Semua ke Normal
                  </button>
                  <button 
                    onClick={() => bulkUpdateSeats('set_vip_rows', ['A', 'B'])}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-lg text-sm"
                  >
                    Jadikan Baris A-B VIP
                  </button>
                  <button 
                    onClick={() => bulkUpdateSeats('maintenance_mode')}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm"
                  >
                    Maintenance Mode
                  </button>
                  {is150CapacityStudio && (
                    <button 
                      onClick={setLastTenToMaintenance}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm"
                    >
                      Atur 10 Kursi Maintenance
                    </button>
                  )}
                </div>
              </div>

              {/* Studio Info */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">ℹ️ Info Studio</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nama:</span>
                    <span className="text-white">{currentStudio?.studio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kapasitas:</span>
                    <span className="text-white">{currentStudio?.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tipe:</span>
                    <span className="text-white">{currentStudio?.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Baris:</span>
                    <span className="text-white">{rows.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kursi/Baris:</span>
                    <span className="text-white">{seatsPerRow}</span>
                  </div>
                  {is150CapacityStudio && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kursi Maintenance:</span>
                      <span className="text-red-400">10 kursi terakhir</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && currentStudio && seats.length === 0 && (
          <div className="text-center py-12">
            <div className="text-yellow-400 text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Studio Belum Memiliki Kursi</h3>
            <p className="text-gray-400 mb-4">
              {is150CapacityStudio 
                ? "Klik tombol di bawah untuk generate kursi otomatis (20 kursi per baris). 10 kursi terakhir akan diatur sebagai maintenance."
                : "Klik tombol di bawah untuk generate kursi otomatis."
              }
            </p>
            <button
              onClick={() => generateSeats(selectedStudio)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold text-lg"
            >
              🪑 Generate Kursi Otomatis
            </button>
          </div>
        )}

        {!loading && studios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-white mb-2">Tidak Ada Studio</h3>
            <p className="text-gray-400 mb-4">Belum ada studio yang terdaftar di sistem.</p>
            <button
              onClick={fetchStudios}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSeats;