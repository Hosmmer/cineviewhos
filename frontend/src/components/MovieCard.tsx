import type { MovieList } from '@/types/movies'

function formatPrice(price: string): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(price))
}

function MovieCard({ movie }: { movie: MovieList }) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-[2/3] bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden relative">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent p-3 translate-y-[calc(100%-3rem)] group-hover:translate-y-0 transition-transform">
          <p className="text-white text-sm font-semibold leading-tight">{movie.title}</p>
          <div className="mt-1 space-y-0.5">
            <p className="text-gray-400 text-xs">{movie.director} &middot; {movie.release_year}</p>
            <p className="text-gray-500 text-xs">{movie.genre_name} &middot; {movie.duration_minutes} min</p>
            <p className="text-red-400 text-xs font-medium">{formatPrice(movie.price)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
