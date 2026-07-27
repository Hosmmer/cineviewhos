---
name: react
description: "React 18 + Vite + TypeScript patterns for CineViewHos. Component patterns, forms (Formik+Yup), data fetching (React Query+Axios), routing, imports. Auto-loaded for frontend/**/* files."
triggers:
  - components
  - hooks
  - forms
  - state
  - routing
  - types
  - api
  - design
  - performance
  - testing
---

# React CineViewHos

React 18 + Vite + TypeScript frontend with dark cinema theme.

## Stack

React 18.3, Vite, TypeScript (strict), React Router 6.26, React Query 5.56, Formik 2.4 + Yup 1.4, Axios 1.7, Tailwind CSS 3.4, lucide-react 1.18, react-intl 6.7 (infra, not actively used), Vitest + Testing Library

## Component Rules (HARD)

1. **Function declarations only**: `function MyComp() {}`, NEVER arrow functions
2. **Default exports**: `export default MyComponent`
3. **Import order**: React → 3rd-party → `@/api` → `@/contexts` → `@/services` → `@/types` → `@/components` → `@/hooks`
4. **Type-only imports**: `import type { User } from "@/types/auth"`

## Quick Patterns

### Forms (Formik + Yup)

```typescript
import { useFormik } from "formik";
import * as yup from "yup";         // auth pages
import * as Yup from "yup";          // admin pages

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
});

const formik = useFormik({
  initialValues: { name: "" },
  validationSchema,
  enableReinitialize: true,
  onSubmit: async (values, { setFieldError }) => {
    try {
      await action(values);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setFieldError("name", msg);
    }
  },
});
```

### Input Template

```tsx
<input
  id="name" type="text"
  {...formik.getFieldProps("name")}
  className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
    formik.touched.name && formik.errors.name
      ? "border-red-500" : "border-gray-700 focus:border-red-500"
  } focus:outline-none focus:ring-1 focus:ring-red-500`}
/>
{formik.touched.name && formik.errors.name && (
  <p className="text-red-400 text-xs mt-1">{formik.errors.name}</p>
)}
```

### Data Fetching

```typescript
const { data, isLoading, error } = useQuery<PaginatedResponse<MovieList>>({
  queryKey: ["admin-movies"],
  queryFn: () => fetchMovies({ ordering: "-created_at" }),
});

const deleteMutation = useMutation({
  mutationFn: deleteMovie,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-movies"] }),
});
```

### Mutation Error

```typescript
const serverError = (createMutation.error || updateMutation.error) as {
  response?: { data?: { detail?: string; name?: string[] } };
} | null;
```

## State Architecture

| State Type | Tool |
|-----------|------|
| Server | React Query (useQuery, useMutation) |
| Form | Formik (useFormik) |
| UI | React useState |
| Auth | AuthContext (single context) |
| Persistent | localStorage (auth_tokens, auth_user, sidebar_collapsed) |

DO NOT add extra context providers or state management libraries.

## Loading / Error States

- **Spinner**: `animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full`
- **Skeleton**: `h-12 bg-gray-800 rounded animate-pulse`
- **Full page error**: `text-red-400` + Retry button (invalidates query)
- **Form field error**: `text-red-400 text-xs mt-1`
- **Error banner**: `text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg px-4 py-3`
- **Button loading**: `{isPending ? "Saving..." : "Save"}`

## CRUD Pattern (Admin)

Every admin entity: `Admin{Entity}List.tsx` (table + delete modal + pagination) + `Admin{Entity}Form.tsx` (create = no id, edit = id from useParams).

## Deep-Dive References

Read BEFORE writing code:

| If working on... | Read... |
|-----------------|---------|
| Custom hooks, React Query | `references/hooks-patterns.md` |
| Context, localStorage, state | `references/state-management.md` |
| Components, layouts, routing | `references/component-architecture.md` |
| Tests | `references/testing-react.md` |
| Performance, lazy loading | `references/performance.md` |
| i18n | `references/i18n.md` |
