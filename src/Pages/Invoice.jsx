import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Invoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, movie, schedule, seats, totalPrice, paymentMethod, bookingDate } = location.state || {};

  // Format number dengan titik untuk ribuan
  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return new Intl.NumberFormat('id-ID').format(numPrice);
  };

  // Format kursi untuk display yang lebih baik
  const formatSeats = (seatsArray) => {
    if (!seatsArray || !Array.isArray(seatsArray)) return '-';
    
    // Jika seats adalah array of objects (dari seat selection)
    if (seatsArray[0] && typeof seatsArray[0] === 'object') {
      return seatsArray.map(seat => seat.kursi_no).join(', ');
    }
    
    // Jika seats adalah array of strings
    return seatsArray.join(', ');
  };

  // Format tanggal Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    // Simulate download
    alert('Invoice berhasil diunduh!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Validasi data
  if (!bookingId || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Data Invoice Tidak Ditemukan</h2>
          <p className="text-gray-400 mb-4">Silakan kembali ke halaman beranda</p>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Message */}
        <div className="text-center mb-8 print:hidden">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Pembayaran Berhasil!</h1>
          <p className="text-gray-400">Tiket Anda telah berhasil dipesan</p>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-lg p-8 mb-6 text-black print:shadow-none print:border print:border-gray-300">
          {/* Header Invoice */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">🎬 BIOSKOP CINEMA</h2>
            <p className="text-gray-600 text-lg">Invoice Pemesanan Tiket</p>
            <p className="text-gray-500 text-sm mt-1">Jl. Cinema No. 123, Jakarta Pusat</p>
          </div>

          {/* Booking Information */}
          <div className="border-b-2 border-dashed border-gray-300 pb-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold mb-1">Booking ID</p>
                <p className="font-bold text-xl text-blue-600">{bookingId}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold mb-1">Tanggal Pemesanan</p>
                <p className="font-semibold text-gray-800">{formatDate(bookingDate)}</p>
              </div>
            </div>

            {/* Movie Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-yellow-500 pl-3">
                Detail Film & Jadwal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Film:</span>
                    <span className="font-semibold text-gray-800 text-right">{movie?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Tanggal Tayang:</span>
                    <span className="font-semibold text-gray-800">{schedule?.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Jam Tayang:</span>
                    <span className="font-semibold text-gray-800">{schedule?.time}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Studio:</span>
                    <span className="font-semibold text-gray-800">{schedule?.studio_name || schedule?.studio || 'Studio 1'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Kursi:</span>
                    <span className="font-semibold text-gray-800 text-right">{formatSeats(seats)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Jumlah Tiket:</span>
                    <span className="font-semibold text-gray-800">{seats?.length} tiket</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-b-2 border-dashed border-gray-300 pb-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">
              Informasi Pembayaran
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Metode Pembayaran:</span>
                <span className="font-semibold text-gray-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Status Pembayaran:</span>
                <span className="font-semibold text-green-600">LUNAS</span>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="text-center">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Total Pembayaran</p>
              <div className="text-3xl font-bold text-yellow-600">
                Rp {formatPrice(totalPrice)}
              </div>
            </div>
            
            {/* Barcode Section */}
            <div className="bg-gray-100 p-6 rounded-lg mb-6 border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-600 mb-3 font-semibold">Kode Tiket Digital</p>
              <div className="font-mono text-lg tracking-widest bg-white p-4 rounded border border-gray-300 text-center">
                {bookingId}
              </div>
              <div className="mt-3 bg-white p-3 rounded border border-gray-300">
                <div className="h-2 bg-black mb-1"></div>
                <div className="h-2 bg-black mb-1"></div>
                <div className="h-2 bg-black mb-1"></div>
                <div className="h-2 bg-black mb-1"></div>
                <div className="h-2 bg-black"></div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs text-red-600 font-semibold text-center">
                ⚠️ INFORMASI PENTING: 
              </p>
              <p className="text-xs text-red-600 text-center mt-1">
                Tunjukkan invoice ini beserta kode tiket digital saat masuk bioskop. 
                Tiket berlaku sesuai jadwal yang tertera dan tidak dapat dipindahtangankan.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-300">
            <p className="text-xs text-gray-500">
              Terima kasih telah memesan di Bioskop Cinema
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Untuk bantuan dan informasi: customer.service@cinema.com | 021-1234-5678
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>🖨️</span>
            <span>Print Invoice</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>📥</span>
            <span>Download PDF</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4 print:hidden">
          <h4 className="text-yellow-400 font-semibold mb-2">Tips:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Simpan invoice ini sebagai bukti pembayaran</li>
            <li>• Datang 30 menit sebelum film dimulai untuk proses check-in</li>
            <li>• Bawa identitas yang sesuai jika diperlukan</li>
            <li>• Tiket tidak dapat dibatalkan atau direfund</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Invoice;