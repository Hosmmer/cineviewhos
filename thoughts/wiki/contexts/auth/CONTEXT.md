# Auth Domain Context

## Glossary

**Access Token**: JWT de corta duración (15 min) que autoriza requests a la API. _Avoid_: token, bearer token.

**AuthContext**: Context de React que maneja el estado de autenticación (user, tokens, login/logout). _Avoid_: auth provider.

**is_staff**: Campo booleano del modelo User que indica si el usuario tiene acceso al panel de administración. Expuesto en el endpoint `/auth/users/me/` vía custom UserSerializer.

**djoser**: Librería Django que provee endpoints REST para autenticación (registro, login, password reset) usando DRF.

**ProtectedRoute**: Componente React que envuelve rutas privadas y redirige a `/login` si no hay token válido.

**Refresh Token**: JWT de larga duración (1 día) usado para obtener nuevos access tokens sin re-autenticar.

**UsernameOrEmailBackend**: Backend de autenticación custom que permite login con username o email.

**Avatar**: Imagen de perfil del usuario almacenada como `ImageField` en el modelo User. Se expone en el endpoint `/auth/users/me/` usando `RelativeImageField` que devuelve URLs relativas (`/media/avatars/xxx.jpg`) para evitar errores de resolución DNS con el hostname interno de Docker. _Avoid_: profile picture, foto.

**UserDrawer**: Panel lateral deslizable (slide-over) disparado desde el avatar en el header. Contiene menú jerárquico con acordeones expandibles (Mi Cuenta, Catálogo, Ventas), encabezado con avatar+nombre+email, y focus trap para accesibilidad. _Avoid_: sidebar, side panel.

**updateUser**: Función del AuthContext que actualiza el estado del usuario en memoria y localStorage tras editar el perfil. Garantiza que componentes como Navbar y UserDrawer reflejen los cambios inmediatamente sin recargar la página.

**RelativeImageField**: Campo serializador de DRF (definido en `apps.movies.serializers`) que retorna URLs relativas en lugar de absolutas. Reutilizado en el UserSerializer para el campo `avatar` ya que el proxy de Vite forwardea requests con `Host: backend:8000` y las URLs absolutas resultan en `ERR_NAME_NOT_RESOLVED` en el navegador.
