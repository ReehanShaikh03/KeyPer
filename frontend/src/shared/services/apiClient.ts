// Base API client using Fetch API matching backend NestJS API requirements

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('keyper_auth_token') : null;
  
  let queryStr = '';
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    queryStr = `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const { params: _params, ...fetchOptions } = options;

  const response = await fetch(`${BASE_URL}${endpoint}${queryStr}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorData = (await response.json()) as { message?: string };
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Fallback
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return request<T>(url, { ...options, method: 'GET' });
  },

  post<T>(url: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  },

  put<T>(url: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  },

  delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return request<T>(url, { ...options, method: 'DELETE' });
  },

  request,
};
