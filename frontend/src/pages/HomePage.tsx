import { useQuery } from '@tanstack/react-query'
import djangoApi from '@/api/django'

interface HealthResponse {
  status: string
}

function HomePage() {
  const { data, isLoading } = useQuery<HealthResponse>({
    queryKey: ['django-health'],
    queryFn: () => djangoApi.get('/health/').then(r => r.data),
  })

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700/50 p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-red-500 text-2xl">&#9654;</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">CineViewHos</h1>
          </div>
          <p className="text-gray-400 text-lg mb-6">Tu plataforma de películas</p>
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full inline-block" />
          ) : (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${data?.status === 'ok' ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${data?.status === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                {data?.status === 'ok' ? 'Backend conectado' : 'Backend offline'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-[2/3] bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white text-xs font-medium">Película {i}</p>
                <p className="text-gray-400 text-xs mt-0.5">2026</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage
