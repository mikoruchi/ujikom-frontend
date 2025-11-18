# 🎬 Sistem Bioskop VisionX Cinema

## 📋 Fitur Lengkap

### 👥 **FITUR USER/PELANGGAN**
- ✅ **Login & Register** - Autentikasi pengguna
- ✅ **Melihat List Film** - Play Now, Coming Soon, History
- ✅ **Detail Film** - Informasi lengkap film
- ✅ **Pilih Jadwal Film** - Berbagai waktu tayang
- ✅ **Pilih Kursi Film** - Interactive seat selection
- ✅ **Pembayaran** - Multiple payment methods
- ✅ **Melihat Invoice** - Digital ticket
- ✅ **Riwayat Pemesanan** - History booking
- ✅ **Edit Profile** - Update data pribadi

### 🔧 **FITUR ADMIN**
- ✅ **Dashboard Admin** - Overview sistem
- ✅ **Kelola Film** - CRUD movies
- ✅ **Kelola Pelanggan** - User management
- ✅ **Kelola Jadwal** - Schedule management
- ✅ **Kelola Harga** - Price management
- ✅ **Kelola Kasir** - Cashier management
- ✅ **Kelola Kursi** - Seat configuration

## 🚀 Cara Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Development Server
```bash
npm run dev
```

### 3. Akses Aplikasi
- **User**: http://localhost:5173
- **Admin**: http://localhost:5173/admin

## 🔐 Login Credentials

### Admin Login
- **Email**: admin@bioskop.com
- **Password**: admin123
- **Redirect**: Otomatis ke /admin (tanpa navbar)

### User Login
- **Email**: user@email.com (atau email apapun)
- **Password**: password123 (atau password apapun)
- **Redirect**: Ke halaman utama (dengan navbar)

## 📁 Struktur Folder

```
src/
├── Pages/
│   ├── Admin/           # Halaman admin
│   │   ├── Dashboard.jsx
│   │   ├── Movies.jsx
│   │   ├── Users.jsx
│   │   ├── Schedules.jsx
│   │   ├── Prices.jsx
│   │   ├── Cashiers.jsx
│   │   └── Seats.jsx
│   ├── Home.jsx         # Halaman utama
│   ├── Login.jsx        # Login page
│   ├── films.jsx        # List film
│   ├── Schedule.jsx     # Jadwal tayang
│   ├── SeatSelection.jsx # Pilih kursi
│   ├── Payment.jsx      # Pembayaran
│   ├── Invoice.jsx      # Invoice/tiket
│   ├── BookingHistory.jsx # Riwayat
│   └── Profile.jsx      # Edit profile
├── components/
│   ├── AdminLayout.jsx  # Layout admin (sidebar)
│   ├── navbar.jsx       # Navbar user
│   └── Footer.jsx       # Footer
└── App.jsx              # Main routing
```

## 🎯 Flow Aplikasi

### User Flow:
1. **Login** → Halaman utama
2. **Pilih Film** → Detail film
3. **Pilih Jadwal** → Pilih kursi
4. **Pilih Kursi** → Pembayaran
5. **Pembayaran** → Invoice
6. **Riwayat** → Lihat semua booking

### Admin Flow:
1. **Login Admin** → Dashboard admin (no navbar)
2. **Kelola Data** → CRUD operations
3. **Monitor** → Statistics & reports

## 🔄 Routing System

### Public Routes (dengan navbar):
- `/` - Home
- `/films` - List film
- `/schedule` - Jadwal
- `/login` - Login
- `/register` - Register

### User Routes (dengan navbar):
- `/profile` - Edit profile
- `/seat-selection` - Pilih kursi
- `/payment` - Pembayaran
- `/invoice` - Invoice
- `/booking-history` - Riwayat

### Admin Routes (tanpa navbar):
- `/admin` - Dashboard
- `/admin/movies` - Kelola film
- `/admin/users` - Kelola user
- `/admin/schedules` - Kelola jadwal
- `/admin/prices` - Kelola harga
- `/admin/cashiers` - Kelola kasir
- `/admin/seats` - Kelola kursi

## 💡 Fitur Khusus

### 🎨 **UI/UX Features**:
- Responsive design (mobile-first)
- Dark theme dengan accent yellow
- Smooth animations & transitions
- Interactive seat selection
- Real-time form validation

### 🔒 **Security Features**:
- Role-based access (admin/user)
- Protected routes
- Local storage management
- Session handling

### 💳 **Payment Integration**:
- Multiple payment methods
- Real-time price calculation
- Invoice generation
- Booking confirmation

### 📊 **Admin Features**:
- Dashboard statistics
- CRUD operations
- Data management
- User monitoring

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State**: React Hooks (useState, useEffect)
- **Storage**: LocalStorage

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Semua komponen sudah dioptimasi untuk berbagai ukuran layar.

## 🎭 Demo Mode

Aplikasi berjalan dalam demo mode tanpa backend:
- Data disimpan di localStorage
- Simulasi API calls
- Mock data untuk testing
- Real-time updates

---

**Developed with ❤️ for VisionX Cinema**