import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // ✅ Ambil semua user
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data user:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle status user: active <-> inactive
  const toggleUserStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      // Panggil API backend
      await axios.put(
        `http://localhost:8000/api/v1/users/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Gagal mengubah status user:", error.response?.data || error);
    }
  };

  // ✅ Hapus user
  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Gagal menghapus user:", error.response?.data || error);
    }
  };

  // Filter user berdasarkan pencarian
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-xl">
        Memuat data pengguna...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Kelola Pengguna</h1>
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
          />
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left text-white p-4">Nama</th>
                  <th className="text-left text-white p-4">Email</th>
                  <th className="text-left text-white p-4">Telepon</th>
                  <th className="text-left text-white p-4">Status</th>
                  <th className="text-left text-white p-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </td>
                    <td className="p-4 text-gray-300">{user.email}</td>
                    <td className="p-4 text-gray-300">{user.phone || "-"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.status)}
                        className={`px-3 py-1 rounded text-sm ${
                          user.status === "active"
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        {user.status === "active" ? "Nonaktif" : "Aktifkan"}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-gray-400">
            Menampilkan {filteredUsers.length} dari {users.length} pengguna
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
