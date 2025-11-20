import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { movie, schedule, seats, totalPrice } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'dana', name: 'DANA', icon: '💳', fee: 0 },
    { id: 'gopay', name: 'GoPay', icon: '🟢', fee: 0 },
    { id: 'ovo', name: 'OVO', icon: '🟣', fee: 0 },
    { id: 'bca', name: 'BCA Virtual Account', icon: '🏦', fee: 2500 },
    { id: 'mandiri', name: 'Mandiri Virtual Account', icon: '🏦', fee: 2500 }
  ];

  // Format number dengan titik untuk ribuan
  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return new Intl.NumberFormat('id-ID').format(numPrice);
  };

  const selectedMethod = paymentMethods.find(method => method.id === paymentMethod);
  const finalPrice = (Number(totalPrice) || 0) + (Number(selectedMethod?.fee) || 0);

  // PERBAIKAN: Format kursi untuk display yang lebih baik
  const formatSeats = (seatsArray) => {
    if (!seatsArray || !Array.isArray(seatsArray)) return '-';
    
    // Jika seats adalah array of objects (dari seat selection)
    if (seatsArray[0] && typeof seatsArray[0] === 'object') {
      return seatsArray.map(seat => seat.kursi_no).join(', ');
    }
    
    // Jika seats adalah array of strings
    return seatsArray.join(', ');
  };

const handlePayment = async () => {
  if (!paymentMethod) {
    alert("Pilih metode pembayaran");
    return;
  }

  if (!seats || seats.length === 0) {
    alert("Pilih kursi terlebih dahulu");
    return;
  }

  setIsProcessing(true);

  const token = localStorage.getItem('token');

  try {
    const selectedSeats = seats.map(seat => seat.kursi_no || seat);

    // 🔥 Perbaikan paling penting
    const jadwalId =
      schedule?.jadwal_id ||
      schedule?.id ||
      schedule?.schedule_id ||
      null;

    if (!jadwalId) {
      alert("Jadwal ID tidak ditemukan! Liat console.");
      console.log("DEBUG schedule:", schedule);
      setIsProcessing(false);
      return;
    }

    const response = await fetch("http://127.0.0.1:8000/api/v1/payments/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        jadwal_id: jadwalId,
        film_id: movie?.id,
        kursi: selectedSeats,
        method: paymentMethod,
        total_amount: finalPrice
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error(data.errors || data);
      alert(data.message || "Gagal memproses pembayaran");
      return;
    }

    navigate("/invoice", {
      state: {
        bookingId: "BKG" + Date.now(),
        movie,
        schedule,
        seats: selectedSeats,
        totalPrice: finalPrice,
        paymentMethod,
        bookingDate: new Date().toISOString(),
        paymentData: data.data
      }
    });

  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat memproses pembayaran");
  } finally {
    setIsProcessing(false);
  }
};


  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Memproses Pembayaran...</h2>
          <p className="text-gray-400">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // PERBAIKAN: Validasi data
  if (!movie || !schedule || !seats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Data Tidak Lengkap</h2>
          <p className="text-gray-400 mb-4">Silakan kembali ke halaman pemilihan kursi</p>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Pembayaran</h1>
          <p className="text-gray-400">Pilih metode pembayaran Anda</p>
        </div>

        {/* Booking Summary - DIPERBAIKI: Format harga dengan titik */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Ringkasan Pemesanan</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Film</span>
              <span className="text-white font-medium">{movie?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Jadwal</span>
              <span className="text-white">{schedule?.date} - {schedule?.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Studio</span>
              <span className="text-white">{schedule?.studio_name || 'Studio'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Kursi</span>
              <span className="text-white">{formatSeats(seats)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Jumlah Tiket</span>
              <span className="text-white">{seats?.length} tiket</span>
            </div>
            <hr className="border-gray-600" />
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">Rp {formatPrice(totalPrice)}</span>
            </div>
            {selectedMethod?.fee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Biaya Admin</span>
                <span className="text-white">Rp {formatPrice(selectedMethod.fee)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-600">
              <span className="text-white">Total Pembayaran</span>
              <span className="text-yellow-400">Rp {formatPrice(finalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods - DIPERBAIKI: Format biaya admin dengan titik */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Metode Pembayaran</h3>
          <div className="space-y-3">
            {paymentMethods.map(method => (
              <label
                key={method.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  paymentMethod === method.id
                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg'
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <div className="text-white font-medium">{method.name}</div>
                    {method.fee === 0 && (
                      <div className="text-green-400 text-xs">Tanpa biaya admin</div>
                    )}
                  </div>
                </div>
                {method.fee > 0 ? (
                  <span className="text-gray-400 text-sm">+Rp {formatPrice(method.fee)}</span>
                ) : (
                  <span className="text-green-400 text-sm">Gratis</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Payment Info - DITAMBAHKAN: Informasi tambahan */}
        {selectedMethod && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-400 text-xl">💡</div>
              <div>
                <h4 className="text-blue-400 font-semibold mb-1">Informasi Pembayaran</h4>
                <p className="text-blue-300 text-sm">
                  {selectedMethod.fee === 0 
                    ? `Pembayaran via ${selectedMethod.name} tidak dikenakan biaya admin`
                    : `Pembayaran via ${selectedMethod.name} dikenakan biaya admin Rp ${formatPrice(selectedMethod.fee)}`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={handlePayment}
            disabled={!paymentMethod}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {paymentMethod ? (
              <>
                <span>Bayar Rp {formatPrice(finalPrice)}</span>
              </>
            ) : (
              'Pilih Metode Pembayaran'
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">Informasi Penting:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Pastikan metode pembayaran sudah benar sebelum melanjutkan</li>
            <li>• Pembayaran via e-wallet (DANA, GoPay, OVO) tidak dikenakan biaya admin</li>
            <li>• Pembayaran via Virtual Account dikenakan biaya admin Rp 2.500</li>
            <li>• Tiket tidak dapat dibatalkan setelah pembayaran berhasil</li>
            <li>• Simpan bukti pembayaran untuk keperluan verifikasi</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Payment;