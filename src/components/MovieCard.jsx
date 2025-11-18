export default function MovieCard({ movie }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transition transform">
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-bold">{movie.title}</h2>
        <p className="text-gray-600">{movie.genre}</p>
        <p className="text-gray-800 mt-2">Harga: Rp{movie.price}</p>
        <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          Beli Tiket
        </button>
      </div>
    </div>
  );
}
