import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "Deadpool & Wolverine",
      theater: "Studio 1 - IMAX",
      date: "Sabtu, 15 Des 2024",
      time: "19:30",
      seats: ["A1", "A2"],
      price: 45000,
      quantity: 2,
      image: "https://assets-prd.ignimgs.com/2024/07/22/deadpool-wolverine-poster-ign-1721666234978.jpg"
    },
    {
      id: 2,
      title: "Inside Out 2",
      theater: "Studio 3 - Regular",
      date: "Minggu, 16 Des 2024", 
      time: "14:30",
      seats: ["C5"],
      price: 40000,
      quantity: 1,
      image: "https://image.tmdb.org/t/p/w500/mFZ1N7qFpiKUpJjyKXz7nN2T8rK.jpg"
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="bg-gray-950 min-h-screen text-white py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">🛍️ Keranjang Tiket</h1>
          <p className="text-gray-400 text-sm sm:text-base">Review dan konfirmasi pesanan Anda</p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎬</div>
            <h2 className="text-2xl font-bold text-gray-400 mb-4">Keranjang Kosong</h2>
            <p className="text-gray-500 mb-8">Belum ada tiket yang dipilih</p>
            <Link
              to="/films"
              className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Pilih Film
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-800">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Movie Poster */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 sm:w-20 h-20 sm:h-28 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    {/* Movie Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 truncate">{item.title}</h3>
                      <div className="space-y-1 text-xs sm:text-sm text-gray-400">
                        <p className="truncate">🏢 {item.theater}</p>
                        <p>📅 {item.date}</p>
                        <p>🕐 {item.time}</p>
                        <p>💺 Kursi: {item.seats.join(", ")}</p>
                      </div>
                      
                      {/* Price & Quantity */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 gap-2 sm:gap-0">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                          >
                            <Minus size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <span className="font-semibold text-sm sm:text-base min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                          >
                            <Plus size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        
                        <div className="text-left sm:text-right">
                          <p className="text-yellow-400 font-bold text-sm sm:text-base">
                            Rp {(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rp {item.price.toLocaleString()} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0 self-start"
                    >
                      <Trash2 size={16} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-800 lg:sticky lg:top-24">
                <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-4">📋 Ringkasan Pesanan</h3>
                
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between text-gray-300 text-sm sm:text-base">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} tiket)</span>
                    <span>Rp {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 text-sm sm:text-base">
                    <span>Pajak (10%)</span>
                    <span>Rp {tax.toLocaleString()}</span>
                  </div>
                  <hr className="border-gray-700" />
                  <div className="flex justify-between text-base sm:text-lg font-bold text-white">
                    <span>Total</span>
                    <span className="text-yellow-400">Rp {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kode Promo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode"
                      className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none text-sm"
                    />
                    <button className="bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm">
                      Terapkan
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 mb-3 text-sm sm:text-base">
                  💳 Lanjut ke Pembayaran
                </button>
                
                <Link
                  to="/films"
                  className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors text-sm sm:text-base"
                >
                  ← Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;