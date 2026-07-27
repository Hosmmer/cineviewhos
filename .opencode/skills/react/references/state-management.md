# State Management — CineViewHos Frontend

## State Architecture

| State Type | Tool |
|-----------|------|
| Server state | `@tanstack/react-query` (useQuery, useMutation) |
| Form state | Formik (useFormik) |
| UI state | React `useState` |
| Auth state | React `AuthContext` (single context provider) |
| Persistent state | `localStorage` |

## Context: AuthContext

Only one context provider in the entire app.

```typescript
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // ... auth logic
  return <AuthContext.Provider value={{...}}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
```

## localStorage Keys

| Key | Value |
|-----|-------|
| `auth_tokens` | JWT access + refresh tokens (JSON) |
| `auth_user` | Serialized User object (JSON) |
| `sidebar_collapsed` | Boolean string |

## Helper Functions (authService.ts)

```typescript
export function saveAuthData(user: User, tokens: AuthTokens): void {
  localStorage.setItem("auth_tokens", JSON.stringify(tokens));
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function clearAuthData(): void {
  localStorage.removeItem("auth_tokens");
  localStorage.removeItem("auth_user");
}
```

## useState Usage

Used for: form toggles, modal state, file preview, success feedback, sidebar state, error messages.

## Query Invalidation

After mutations, invalidate relevant queries:
```typescript
queryClient.invalidateQueries({ queryKey: ["admin-genres"] });
```

## Rule

Do NOT add additional context providers or state management libraries without explicit approval. The existing pattern covers all use cases.
