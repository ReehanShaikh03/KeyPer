import { api, setAccessToken, getAccessToken } from './api';
import { AxiosError } from 'axios';

export interface RequestOptions {
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: { method?: string; body?: any } & RequestOptions = {}): Promise<T> {
  try {
    const response = await api.request<T>({
      url: endpoint,
      method: options.method || 'GET',
      data: options.body,
      params: options.params,
      headers: options.headers,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || error.message || `HTTP Error ${error.response?.status}`;
      throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }
    throw error;
  }
}

export const apiClient = {
  get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return request<T>(url, { ...options, method: 'GET' });
  },

  post<T>(url: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body,
    });
  },

  put<T>(url: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body,
    });
  },

  delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return request<T>(url, { ...options, method: 'DELETE' });
  },

  request,
};

export { setAccessToken, getAccessToken };
