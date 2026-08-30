import axios from "axios";

const djangoApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

djangoApi.interceptors.request.use((config) => {
  const tokens = localStorage.getItem("auth_tokens");
  if (tokens) {
    try {
      const { access } = JSON.parse(tokens);
      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    } catch {
      localStorage.removeItem("auth_tokens");
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

const refreshAxios = axios.create({ baseURL: "/api" });

djangoApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokensRaw = localStorage.getItem("auth_tokens");
      if (!tokensRaw) return Promise.reject(error);
      try {
        const tokens = JSON.parse(tokensRaw);
        const { data } = await refreshAxios.post("/auth/jwt/refresh/", {
          refresh: tokens.refresh,
        });
        const newTokens = { ...tokens, access: data.access };
        localStorage.setItem("auth_tokens", JSON.stringify(newTokens));
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return djangoApi(originalRequest);
      } catch {
        localStorage.removeItem("auth_tokens");
        localStorage.removeItem("auth_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default djangoApi;
