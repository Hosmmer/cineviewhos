import djangoApi from "@/api/django";
import type {
  LoginCredentials,
  RegisterData,
  User,
  AuthTokens,
} from "@/types/auth";

export async function loginUser(
  credentials: LoginCredentials,
): Promise<{ user: User; tokens: AuthTokens }> {
  const tokenRes = await djangoApi.post<AuthTokens>(
    "/auth/jwt/create/",
    credentials,
  );
  const tokens = tokenRes.data;
  const userRes = await djangoApi.get<User>("/auth/users/me/", {
    headers: { Authorization: `Bearer ${tokens.access}` },
  });
  return { user: userRes.data, tokens };
}

export async function registerUser(data: RegisterData): Promise<User> {
  const res = await djangoApi.post<User>("/auth/users/", data);
  return res.data;
}

export async function resetPasswordRequest(email: string): Promise<void> {
  await djangoApi.post("/auth/users/reset_password/", { email });
}

export async function resetPasswordConfirm(
  uid: string,
  token: string,
  new_password: string,
  re_new_password: string,
): Promise<void> {
  await djangoApi.post("/auth/users/reset_password_confirm/", {
    uid,
    token,
    new_password,
    re_new_password,
  });
}

export async function updateProfile(formData: FormData): Promise<User> {
  const res = await djangoApi.patch<User>("/auth/users/me/", formData);
  return res.data;
}

export async function changePassword(
  current_password: string,
  new_password: string,
  re_new_password: string,
): Promise<void> {
  await djangoApi.post("/auth/users/set_password/", {
    current_password,
    new_password,
    re_new_password,
  });
}

export function saveAuthData(user: User, tokens: AuthTokens): void {
  localStorage.setItem("auth_tokens", JSON.stringify(tokens));
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function clearAuthData(): void {
  localStorage.removeItem("auth_tokens");
  localStorage.removeItem("auth_user");
}

export function loadAuthData(): {
  user: User | null;
  tokens: AuthTokens | null;
} {
  try {
    const tokensRaw = localStorage.getItem("auth_tokens");
    const userRaw = localStorage.getItem("auth_user");
    return {
      tokens: tokensRaw ? JSON.parse(tokensRaw) : null,
      user: userRaw ? JSON.parse(userRaw) : null,
    };
  } catch {
    clearAuthData();
    return { user: null, tokens: null };
  }
}
