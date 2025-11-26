import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import AdminLayout from "./components/AdminLayout";
import CashierLayout from "./components/CashierLayout";
import Films from "./Pages/films";
import Home from "./Pages/Home";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import Schedule from "./Pages/Schedule";
import MovieDetail from "./Pages/MovieDetail";
import NotFound from "./Pages/NotFound";
import SeatSelection from "./Pages/SeatSelection";
import Payment from "./Pages/Payment";
import Invoice from "./Pages/Invoice";
import BookingHistory from "./Pages/BookingHistory";

// Admin Pages
import AdminDashboard from "./Pages/Admin/Dashboard";
import AdminMovies from "./Pages/Admin/Movies";
import AdminUsers from "./Pages/Admin/Users";
import AdminSchedules from "./Pages/Admin/Schedules";
import AdminCashiers from "./Pages/Admin/Cashiers";
import AdminSeats from "./Pages/Admin/Seats";
import AdminStudios from "./Pages/Admin/Studios";

// Cashier & Owner Pages
import CashierDashboard from "./Pages/Cashier/Dashboard";
import CashierDataTransaksi from "./Pages/Cashier/DataTransaksi";
import OwnerDashboard from "./Pages/Owner/OwnerDashboard";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCashierRoute = location.pathname.startsWith('/cashier');
  const isOwnerRoute = location.pathname.startsWith('/owner');
  const isInvoiceRoute = location.pathname === '/invoice';

  if (isAdminRoute) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/movies" element={<AdminMovies />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/schedules" element={<AdminSchedules />} />
          <Route path="/admin/cashiers" element={<AdminCashiers />} />
          <Route path="/admin/seats" element={<AdminSeats />} />
          <Route path="/admin/studios" element={<AdminStudios />} />
        </Routes>
      </AdminLayout>
    );
  }

  if (isCashierRoute) {
    return (
      <CashierLayout>
        <Routes>
          <Route path="/cashier" element={<CashierDashboard />} />
          <Route path="/cashier/DataTransaksi" element={<CashierDataTransaksi />} />
        </Routes>
      </CashierLayout>
    );
  }

  if (isOwnerRoute) {
    return (
      <Routes>
        <Route path="/owner" element={<OwnerDashboard />} />
      </Routes>
    );
  }

  // Untuk route invoice, tidak render navbar dan footer
  if (isInvoiceRoute) {
    return (
      <Routes>
        <Route path="/invoice" element={<Invoice />} />
      </Routes>
    );
  }

  // Untuk route lainnya, render dengan navbar dan footer
  return (
    <div className="bg-gray-950 min-h-screen">
      <Navbar />
      
      <main className="min-h-screen">
        <Routes>
          {/* Halaman utama */}
          <Route path="/" element={<Home />} />
          
          {/* Halaman Film */}
          <Route path="/films" element={<Films />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          
          {/* Halaman Kontak */}
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Role-based redirects */}
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Halaman Schedule */}
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/seat-selection" element={<SeatSelection />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;