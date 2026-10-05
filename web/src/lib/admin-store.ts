const TOKEN_KEY = "ngi_admin_token";

export type AdminUser = { email: string };

/** Session token in localStorage. Cleared by `signOut`. */
export const getToken = (): string | null =>
  typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) =>
  window.localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => window.localStorage.removeItem(TOKEN_KEY);

/** Every admin request carries the bearer token. */
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4005"}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  // A rejected token means the session is gone; clear it so the UI can bounce.
  if (res.status === 401) clearToken();

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(payload?.message ?? `Request failed (${res.status})`);
  }

  return payload as T;
}
