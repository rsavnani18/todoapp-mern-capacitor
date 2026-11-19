const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'todo_auth_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.get();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      tokenStorage.clear();
    }
    const firstFieldError = data.errors
      ? Object.values(data.errors as Record<string, string[]>)[0]?.[0]
      : undefined;
    throw new Error(firstFieldError || data.message || 'Something went wrong');
  }

  return data as T;
}
