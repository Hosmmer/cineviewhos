# Performance — CineViewHos Frontend

## Lazy Loading Pages

All page components are lazy-loaded in `App.tsx`:

```typescript
const HomePage = React.lazy(() => import("@/pages/HomePage"));
const LoginPage = React.lazy(() => import("@/pages/LoginPage"));
```

Routes wrapped in `<Suspense>` with loading fallback:
```tsx
<Suspense fallback={<div className="animate-spin ..." />}>
  <Routes>...</Routes>
</Suspense>
```

## React Query Caching

```typescript
useQuery({
  queryKey: ["modules"],
  queryFn: fetchModules,
  staleTime: 5 * 60 * 1000,    // 5 min before stale
  refetchInterval: 60 * 1000,   // auto-refetch every 1 min
  refetchOnWindowFocus: true,
});
```

## select_related / prefetch_related (Backend)

Views should optimize querysets:
```python
def get_queryset(self):
    return Movie.objects.filter(is_active=True).select_related("genre", "director_fk")
```

## Image Optimization

- Use `upload_to` for organized media storage
- `RelativeImageField` returns relative URLs

## Network

- Axios instance with baseURL `/api` — requests go through Vite proxy in dev
- JWT token auto-refresh on 401 (response interceptor)
- Request interceptor attaches Bearer token automatically

## DO NOT

- Add manual `useMemo`/`useCallback` without profiling evidence of a problem
- Add Redux, Zustand, or any additional state library
- Eager-load admin pages (always lazy-load)
