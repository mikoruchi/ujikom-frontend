import React, { useState } from "react";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-700 transition-colors" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-semibold text-white mb-2 flex items-center justify-between">
          <span className="flex items-center">
            <span className="mr-2">❓</span>
            {question}
          </span>
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ⬇️
          </span>
        </h3>
        <p className="text-gray-400 text-sm">
          {isOpen ? '' : 'Klik untuk melihat jawaban'}
        </p>
      </div>
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-300 text-sm">{answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: "Bagaimana cara membeli tiket online?",
      answer: "Anda dapat membeli tiket melalui website kami atau aplikasi mobile. Pilih film, jadwal, dan kursi yang diinginkan."
    },
    {
      question: "Apakah bisa refund tiket?",
      answer: "Refund dapat dilakukan maksimal 2 jam sebelum jadwal tayang dengan potongan biaya administrasi."
    },
    {
      question: "Apa saja fasilitas yang tersedia?",
      answer: "Kami menyediakan IMAX, 4DX, Dolby Atmos, cafe, dan area parkir yang luas."
    },
    {
      question: "Bagaimana cara menjadi member?",
      answer: "Daftar gratis melalui website atau aplikasi untuk mendapatkan poin dan diskon khusus member."
    },
    {
      question: "Apakah ada promo khusus?",
      answer: "Ya, kami rutin mengadakan promo untuk member, student discount, dan promo hari-hari tertentu."
    },
    {
      question: "Bagaimana sistem pembayaran?",
      answer: "Kami menerima pembayaran tunai, kartu debit/kredit, e-wallet, dan QRIS."
    }
  ];

  return (
    <div className="mt-16 bg-gray-900 rounded-2xl p-8 border border-gray-800">
      <h2 className="text-2xl font-bold text-yellow-400 mb-8 text-center">
        Pertanyaan yang Sering Diajukan
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {faqs.slice(0, 3).map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
        
        <div className="space-y-4">
          {faqs.slice(3, 6).map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-300">
            Ada pertanyaan? Kami siap membantu Anda!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">Kirim Pesan</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  placeholder="Masukkan nama Anda"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  placeholder="nama@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subjek
                </label>
                <select className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none">
                  <option>Pilih subjek</option>
                  <option>Informasi Tiket</option>
                  <option>Keluhan Layanan</option>
                  <option>Saran & Masukan</option>
                  <option>Kerjasama</option>
                  <option>Lainnya</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pesan
                </label>
                <textarea
                  rows="5"
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  placeholder="Tulis pesan Anda di sini..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Kirim Pesan
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">Informasi Kontak</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-500 p-3 rounded-lg">
                    <span className="text-black text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Alamat</h3>
                    <p className="text-gray-400">
                      Jl. Sudirman No. 123<br />
                      Jakarta Pusat, DKI Jakarta 10220
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-500 p-3 rounded-lg">
                    <span className="text-black text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Telepon</h3>
                    <p className="text-gray-400">
                      (021) 1234-5678<br />
                      0812-3456-7890
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-500 p-3 rounded-lg">
                    <span className="text-black text-xl">✉️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <p className="text-gray-400">
                      info@visionxcinema.com<br />
                      support@visionxcinema.com
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-500 p-3 rounded-lg">
                    <span className="text-black text-xl">🕐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Jam Operasional</h3>
                    <p className="text-gray-400">
                      Senin - Minggu: 09:00 - 23:00 WIB<br />
                      Customer Service: 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">Ikuti Kami</h2>
              <div className="grid grid-cols-2 gap-4">
                <a href="#" className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
                  <span className="text-2xl">📘</span>
                  <span className="text-white">Facebook</span>
                </a>
                <a href="#" className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
                  <span className="text-2xl">📷</span>
                  <span className="text-white">Instagram</span>
                </a>
                <a href="#" className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
                  <span className="text-2xl">🐦</span>
                  <span className="text-white">Twitter</span>
                </a>
                <a href="#" className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
                  <span className="text-2xl">📺</span>
                  <span className="text-white">YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <FAQSection />
      </div>
    </div>
  );
};

export default Contact;