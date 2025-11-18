import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const navigate = useNavigate();
  
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    oldPassword: "",
    newPassword: "",
    profile: "",
    memberSince: "2024-01-01",
    totalPoints: 2500,
    memberLevel: "Gold"
  });

  // Fungsi untuk mengambil data user dari API Laravel
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:8000/api/user", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(prev => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          profile: data.profile || "",
          oldPassword: "",
          newPassword: ""
        }));
        
        localStorage.setItem("user", JSON.stringify(data));
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback ke localStorage jika API gagal
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserInfo(prev => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          profile: userData.profile || "",
          oldPassword: "",
          newPassword: ""
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  // Fungsi untuk menyimpan perubahan ke API Laravel
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      // Validasi input
      if (!userInfo.name.trim()) {
        alert("Nama tidak boleh kosong");
        setSaveLoading(false);
        return;
      }
      
      if (!userInfo.email.trim()) {
        alert("Email tidak boleh kosong");
        setSaveLoading(false);
        return;
      }

      // Jika ada password baru, validasi password lama
      if (userInfo.newPassword && !userInfo.oldPassword) {
        alert("Harap masukkan password lama untuk mengubah password");
        setSaveLoading(false);
        return;
      }

      const updateData = {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        profile: userInfo.profile
      };

      if (userInfo.newPassword) {
        updateData.old_password = userInfo.oldPassword;
        updateData.password = userInfo.newPassword;
        updateData.password_confirmation = userInfo.newPassword;
      }

      const response = await fetch("http://localhost:8000/api/user", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        
        setUserInfo(prev => ({
          ...prev,
          name: data.name,
          email: data.email,
          phone: data.phone,
          profile: data.profile,
          oldPassword: "",
          newPassword: ""
        }));

        localStorage.setItem("user", JSON.stringify(data));
        window.dispatchEvent(new Event("userChanged"));
        
        setIsEditing(false);
        alert("Profil berhasil diperbarui!");
      } else {
        const errorData = await response.json();
        alert(`Gagal memperbarui profil: ${errorData.message || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profil: " + error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        return;
      }

      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        alert("File harus berupa gambar");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUserInfo({
          ...userInfo,
          profile: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userChanged"));
    navigate("/");
  };

  const handleCancelEdit = () => {
    // Reset form dengan data asli
    fetchUserData();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Memuat profil...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
              <span className="text-lg sm:text-xl font-black text-black">🎬</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-extrabold text-yellow-400">Vision</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-red-500 ml-1">X</span>
            </div>
          </Link>
        </div>



        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Left Side - Profile Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-900 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-800 shadow-2xl">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Profil Saya</h1>
                  <p className="text-gray-400 text-sm sm:text-base">Kelola informasi akun Anda</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                  >
                    ✏️ Edit Profil
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saveLoading ? "Menyimpan..." : "💾 Simpan"}
                    </button>
                  </div>
                )}
              </div>

              <form className="space-y-4 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Nama & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userInfo.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50 text-sm sm:text-base"
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userInfo.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50 text-sm sm:text-base"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Phone & Password Lama */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userInfo.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50 text-sm sm:text-base"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password Lama
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={userInfo.oldPassword}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50 text-sm sm:text-base"
                      placeholder="Masukkan password lama"
                    />
                  </div>
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={userInfo.newPassword}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50 text-sm sm:text-base"
                    placeholder="Masukkan password baru"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Link
                    to="/"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 sm:py-3 rounded-lg transition-colors text-center font-medium text-sm sm:text-base"
                  >
                    ← Kembali ke Beranda
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
                  >
                    🚪 Keluar
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Member Info */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl">
              <div className="text-center">
                {/* Profile Image */}
                <div className="relative inline-block mb-4">
                  <div className="w-20 sm:w-24 h-20 sm:h-24 bg-black/20 rounded-full overflow-hidden flex items-center justify-center text-3xl sm:text-4xl mx-auto border-4 border-black/10">
                    {userInfo.profile ? (
                      <img
                        src={userInfo.profile}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl sm:text-4xl">👤</span>
                    )}
                  </div>
                  
                  {/* Upload Button - hanya tampil saat edit */}
                  {isEditing && (
                    <label className="absolute -bottom-1 -right-1 bg-black hover:bg-gray-800 text-yellow-400 p-2 rounded-full cursor-pointer shadow-lg transition-all duration-300 transform hover:scale-110">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={!isEditing}
                      />
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </label>
                  )}
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                  {userInfo.name || "User"}
                </h2>
                <p className="text-black/80 text-sm sm:text-base mb-4">{userInfo.email}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <span className="bg-black/20 text-black px-4 py-2 rounded-full text-sm font-bold">
                    🏆 Member {userInfo.memberLevel}
                  </span>
                  <span className="text-black/80 text-sm font-semibold">
                    ⭐ {userInfo.totalPoints.toLocaleString()} Poin
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎬</div>
                  <div className="text-yellow-400 font-bold text-lg">12</div>
                  <div className="text-gray-400 text-sm">Film Ditonton</div>
                </div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎆</div>
                  <div className="text-yellow-400 font-bold text-lg">3</div>
                  <div className="text-gray-400 text-sm">Bulan Ini</div>
                </div>
              </div>
            </div>

            {/* Achievement */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 sm:p-6 rounded-xl border border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-500 p-3 rounded-full">
                  <span className="text-xl">🏅</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Movie Enthusiast</h3>
                  <p className="text-gray-400 text-sm">Selamat! Anda telah menonton 10+ film bulan ini</p>
                  <div className="mt-2 bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;