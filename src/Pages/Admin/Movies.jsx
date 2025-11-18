import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const availableGenres = [
    "Action", "Animation", "Sci-Fi", "Comedy", "Drama",
    "Family", "Adventure", "Crime", "Biography", "Horror"
  ];

  // PERBAIKAN: Hanya 2 status yang sesuai dengan database
  const statusOptions = [
    "playing",
    "upcoming"
  ];

  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    duration: "",
    status: "playing", // Default value diperbaiki
    studio: "",
    poster: "",
    trailer: "",
    synopsis: "",
    rating: "",
    release_date: "",
  });

  // ==============================
  // AUTHENTICATION FUNCTIONS
  // ==============================
  const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const createApiInstance = () => {
    const token = getAuthToken();
    
    return axios.create({
      baseURL: 'http://localhost:8000/api/v1',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
  };

  const checkAuthentication = () => {
    const token = getAuthToken();
    if (!token) {
      setError("Anda belum login. Silakan login terlebih dahulu.");
      navigate("/login");
      return false;
    }
    return true;
  };

  // ==============================
  // FETCH MOVIES
  // ==============================
  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!checkAuthentication()) return;

      const api = createApiInstance();
      const response = await api.get('/films');
      
      console.log('📋 Movies response:', response.data);
      
      if (response.data.success) {
        setMovies(response.data.data || []);
      } else {
        setError(response.data.message || 'Gagal memuat data film');
      }
    } catch (err) {
      console.error("❌ Error fetching movies:", err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      setError("Session telah berakhir. Silakan login kembali.");
      navigate("/login");
    } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
      setError('Koneksi gagal. Pastikan server berjalan di http://localhost:8000');
    } else {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan');
    }
  };

  // ==============================
  // GENRE HANDLING
  // ==============================
  const handleGenreToggle = (genre) => {
    setFormData((prev) => {
      const currentGenres = prev.genre ? prev.genre.split(',').map(g => g.trim()).filter(g => g) : [];
      
      if (currentGenres.includes(genre)) {
        // Remove genre
        const newGenres = currentGenres.filter(g => g !== genre);
        return {
          ...prev,
          genre: newGenres.join(', ')
        };
      } else {
        // Add genre
        const newGenres = [...currentGenres, genre];
        return {
          ...prev,
          genre: newGenres.join(', ')
        };
      }
    });
  };

  // ==============================
  // INPUT HANDLING
  // ==============================
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === null ? "" : value
    }));
  };

  // ==============================
  // FORM SUBMIT - DIPERBAIKI
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkAuthentication()) return;

    // Validasi genre
    if (!formData.genre || formData.genre.trim() === '') {
      alert("❌ Pilih minimal satu genre!");
      return;
    }

    // Validasi studio
    if (!formData.studio.trim()) {
      alert("❌ Nama studio harus diisi!");
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        genre: formData.genre,
        duration: parseInt(formData.duration) || 0,
        status: formData.status, // Sudah sesuai dengan database
        studio: formData.studio.trim(),
        poster: formData.poster?.trim() || null,
        trailer: formData.trailer?.trim() || null,
        synopsis: formData.synopsis?.trim() || null,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        release_date: formData.release_date || null
      };

      console.log("📤 Payload:", payload);

      const api = createApiInstance();

      let response;
      if (editingMovie) {
        response = await api.put(`/films/${editingMovie.id}`, payload);
        alert("✅ Film berhasil diperbarui!");
      } else {
        response = await api.post('/films', payload);
        alert("✅ Film berhasil ditambahkan!");
      }

      console.log("📥 Response:", response.data);

      resetForm();
      fetchMovies(); // Refresh data
      
    } catch (err) {
      console.error("❌ Error saving movie:", err);
      console.error("❌ Error details:", err.response?.data);
      
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const errorMessage = Object.values(errors).flat().join(', ');
        alert("❌ Validasi gagal: " + errorMessage);
      } else {
        handleApiError(err);
      }
    }
  };

  // ==============================
  // DELETE MOVIE
  // ==============================
  const deleteMovie = async (id) => {
    if (!confirm("Yakin ingin menghapus film ini?")) return;
    if (!checkAuthentication()) return;

    try {
      const api = createApiInstance();
      await api.delete(`/films/${id}`);
      alert("🗑️ Film berhasil dihapus!");
      fetchMovies(); // Refresh list
    } catch (err) {
      console.error("Error deleting movie:", err);
      handleApiError(err);
    }
  };

  // ==============================
  // EDIT MOVIE - DIPERBAIKI
  // ==============================
  const editMovie = (movie) => {
    console.log('✏️ Editing movie:', movie);
    
    setEditingMovie(movie);
    setFormData({
      title: movie.title || "",
      genre: movie.genre || "",
      duration: movie.duration || "",
      status: movie.status || "playing", // Default value diperbaiki
      studio: movie.studio || "",
      poster: movie.poster || "",
      trailer: movie.trailer || "",
      synopsis: movie.synopsis || "",
      rating: movie.rating || "",
      release_date: movie.release_date || "",
    });
    setShowForm(true);
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      title: "",
      genre: "",
      duration: "",
      status: "playing", // Default value diperbaiki
      studio: "",
      poster: "",
      trailer: "",
      synopsis: "",
      rating: "",
      release_date: "",
    });
    setEditingMovie(null);
    setShowForm(false);
  };

  // Safe image URL
  const getSafeImageUrl = (url) => {
    if (!url || url.includes('via.placeholder.com') || url.trim() === '') {
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%236b7280'%3ENo Poster%3C/text%3E%3C/svg%3E`;
    }
    return url;
  };

  // PERBAIKAN: Status info untuk tampilan yang user-friendly
  const getStatusInfo = (status) => {
    const statusMap = {
      'playing': { text: "Sedang Tayang", style: "bg-green-500 text-white" },
      'upcoming': { text: "Akan Datang", style: "bg-yellow-500 text-black" },
    };
    
    return statusMap[status] || { text: status, style: "bg-gray-500 text-white" };
  };

  // PERBAIKAN: Fungsi untuk menampilkan label status di form
  const getStatusLabel = (status) => {
    const statusLabels = {
      'playing': 'Sedang Tayang',
      'upcoming': 'Akan Datang'
    };
    return statusLabels[status] || status;
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Loading state
  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-white">Memuat data film...</p>
      </div>
    </div>
  );

  // Genre Filter
  const filteredMovies = selectedGenre === "all" 
    ? movies 
    : movies.filter(movie => 
        movie.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Film</h1>
            <p className="text-gray-400 mt-1">Total: {movies.length} film</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Tambah Film
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold mb-1">❌ Error</h3>
                <p>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Connection Test */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-yellow-400 font-semibold">Status Koneksi</h3>
              <p className="text-white text-sm">
                {movies.length > 0 ? '✅ Terhubung ke database' : '❌ Tidak ada data'}
              </p>
            </div>
            <button 
              onClick={fetchMovies}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Genre Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">Filter by Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
            >
              <option value="all">🎭 All Genres</option>
              {availableGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FORM POPUP */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {editingMovie ? "Edit Film" : "Tambah Film Baru"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="text-white block mb-2">Judul Film *</label>
                    <input
                      type="text"
                      placeholder="Masukkan judul film"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Genre */}
                  <div className="md:col-span-2">
                    <label className="text-white block mb-2">Genre *</label>
                    <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableGenres.map((genre) => {
                          const isSelected = formData.genre?.includes(genre);
                          return (
                            <label key={genre} className="flex items-center space-x-2 text-white cursor-pointer hover:bg-gray-600 p-2 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleGenreToggle(genre)}
                                className="w-4 h-4 text-yellow-500 bg-gray-600 border-gray-500 rounded focus:ring-yellow-500"
                              />
                              <span className="text-sm">{genre}</span>
                            </label>
                          );
                        })}
                      </div>
                      {formData.genre && (
                        <div className="mt-3 p-2 bg-yellow-500/20 rounded">
                          <p className="text-yellow-400 text-sm font-semibold">
                            Genre terpilih: {formData.genre}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-white block mb-2">Durasi (menit) *</label>
                    <input
                      type="number"
                      placeholder="Contoh: 120"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                      required
                      min="1"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="text-white block mb-2">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="Contoh: 8.5"
                      value={formData.rating}
                      onChange={(e) => handleInputChange('rating', e.target.value)}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  {/* Release Date */}
                  <div>
                    <label className="text-white block mb-2">Tanggal Rilis</label>
                    <input
                      type="date"
                      value={formData.release_date}
                      onChange={(e) => handleInputChange('release_date', e.target.value)}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-white block mb-2">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Studio */}
                  <div className="md:col-span-2">
                    <label className="text-white block mb-2">Studio Pembuat Film *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Marvel Studios, Warner Bros, dll"
                      value={formData.studio}
                      onChange={(e) => handleInputChange('studio', e.target.value)}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Poster URL */}
                  <div>
                    <label className="text-white block mb-2">Poster URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/poster.jpg"
                      value={formData.poster}
                      onChange={(e) => handleInputChange('poster', e.target.value)}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  {/* Trailer URL */}
                  <div>
                    <label className="text-white block mb-2">Trailer URL</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/embed/..."
                      value={formData.trailer}
                      onChange={(e) => handleInputChange('trailer', e.target.value)}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  {/* Synopsis */}
                  <div className="md:col-span-2">
                    <label className="text-white block mb-2">Sinopsis</label>
                    <textarea
                      placeholder="Masukkan sinopsis film..."
                      value={formData.synopsis}
                      onChange={(e) => handleInputChange('synopsis', e.target.value)}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none h-24 resize-none"
                      rows="4"
                    />
                  </div>
                </div>

                {/* Preview */}
                {formData.poster && (
                  <div className="mt-4">
                    <label className="text-white block mb-2">Preview Poster:</label>
                    <img 
                      src={getSafeImageUrl(formData.poster)} 
                      alt="Preview" 
                      className="h-32 object-cover rounded border border-gray-600"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition-colors"
                  >
                    {editingMovie ? "Update Film" : "Simpan Film"}
                  </button>
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MOVIE LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {movies.length === 0 ? 'Belum ada film' : 'Tidak ada film dengan genre ini'}
              </h3>
              <p className="text-gray-400 mb-4">
                {movies.length === 0 
                  ? 'Klik "Tambah Film" untuk menambahkan film pertama' 
                  : `Coba pilih genre lain atau tambah film baru dengan genre ${selectedGenre}`
                }
              </p>
              {movies.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold"
                >
                  + Tambah Film Pertama
                </button>
              )}
            </div>
          ) : (
            filteredMovies.map((movie) => {
              const statusInfo = getStatusInfo(movie.status);
              return (
                <div key={movie.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-yellow-500 transition-colors shadow-lg">
                  <img 
                    src={getSafeImageUrl(movie.poster)} 
                    alt={movie.title} 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.src = getSafeImageUrl();
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">{movie.title}</h3>
                    
                    <div className="space-y-1 mb-3">
                      <p className="text-gray-400 text-sm">
                        <span className="text-yellow-400">Genre:</span> {movie.genre || '-'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        <span className="text-yellow-400">Durasi:</span> {movie.duration} menit
                      </p>
                      <p className="text-gray-400 text-sm">
                        <span className="text-yellow-400">Studio:</span> {movie.studio || '-'}
                      </p>
                      {movie.rating > 0 && (
                        <p className="text-gray-400 text-sm">
                          <span className="text-yellow-400">Rating:</span> ⭐ {movie.rating}/10
                        </p>
                      )}
                      {movie.release_date && (
                        <p className="text-gray-400 text-sm">
                          <span className="text-yellow-400">Rilis:</span> {new Date(movie.release_date).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusInfo.style}`}>
                        {statusInfo.text}
                      </span>
                      {movie.synopsis && (
                        <button 
                          onClick={() => alert(`Sinopsis:\n\n${movie.synopsis}`)}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          📖 Baca Sinopsis
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => editMovie(movie)} 
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteMovie(movie.id)} 
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminMovies;