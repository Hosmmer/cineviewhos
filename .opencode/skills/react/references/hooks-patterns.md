# React Hooks — CineViewHos Frontend

## Custom Hooks (React Query Wrappers)

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchModules } from "@/services/moduleService";
import type { Module } from "@/types/modules";

export function useModules() {
  return useQuery<Module[]>({
    queryKey: ["modules"],
    queryFn: fetchModules,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
```

## Hook File Conventions

- One hook per file: `src/hooks/use{Name}.ts`
- Named export, function declaration
- Type generics on `useQuery<T>`

## Query Keys

- Always kebab-case arrays: `["admin-movies"]`, `["public-movies"]`
- Include relevant params in the key: `["admin-movies", search, page]`

## In-Component useQuery

```typescript
const { data, isLoading, error } = useQuery<PaginatedResponse<MovieList>>({
  queryKey: ["public-movies"],
  queryFn: () => fetchMovies({ ordering: "-created_at" }),
});
```

## useMutation Pattern

```typescript
const deleteMutation = useMutation({
  mutationFn: deleteGenre,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin-genres"] });
    setDeleteId(null);
  },
});
```

## Mutation Error Type

```typescript
const serverError = (createMutation.error || updateMutation.error) as {
  response?: { data?: { detail?: string; name?: string[] } };
} | null;
```

## Formik + Mutation

```typescript
const formik = useFormik({
  initialValues: { name: "" },
  validationSchema,
  enableReinitialize: true,
  onSubmit: (values) => {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  },
});
```

## useRef Patterns

- `fileInputRef` for hidden file input click
- `drawerRef` for focus trap management
- `previousFocusRef` for restoring focus on drawer close

## Provider Hierarchy (main.tsx)

```
QueryClientProvider → IntlProvider → BrowserRouter → AuthProvider → App
```

## Auth Hook

```typescript
import { useAuth } from "@/contexts/AuthContext";

const { user, login, logout, register, isAuthenticated, isLoading } = useAuth();
```
