import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'blog_auth_token';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const isTokenValid = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token !== null && isTokenValid(token);
};

export const getAuthHeaders = (): { Authorization?: string } => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};