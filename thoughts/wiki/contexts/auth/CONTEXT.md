# Auth Domain Context

## Glossary

**Access Token**: JWT de corta duración (15 min) que autoriza requests a la API. _Avoid_: token, bearer token.

**AuthContext**: Context de React que maneja el estado de autenticación (user, tokens, login/logout). _Avoid_: auth provider.

**djoser**: Librería Django que provee endpoints REST para autenticación (registro, login, password reset) usando DRF.

**ProtectedRoute**: Componente React que envuelve rutas privadas y redirige a `/login` si no hay token válido.

**Refresh Token**: JWT de larga duración (1 día) usado para obtener nuevos access tokens sin re-autenticar.

**UsernameOrEmailBackend**: Backend de autenticación custom que permite login con username o email.
