import type { ApiError, AuthResponse, User } from '../../../shared/types';

// Local dev: Vite proxies /api → localhost:5000. Deployed (Vercel): the
// frontend is static, so set VITE_API_URL to the backend's URL
// (e.g. https://cube-tech-pos-api.vercel.app). No trailing slash.
const API_BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`;

const TOKEN_KEY = 'pos.token';

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token === null) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// AuthContext registers here so a rejected session clears app state without
// this module having to import React.
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers
    }
  });

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => ({ error: 'Request failed' }))) as Partial<ApiError>;

    // Only an already-authenticated request can expire a session. A 401 from
    // /auth/login means bad credentials, not a dead token.
    if (response.status === 401 && token) {
      setToken(null);
      onUnauthorized?.();
    }

    throw new ApiRequestError(body.error || 'Request failed', response.status);
  }

  return response.json() as Promise<T>;
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function fetchMe(): Promise<User> {
  return fetchApi<User>('/auth/me');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
