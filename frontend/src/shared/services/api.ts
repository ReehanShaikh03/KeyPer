import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api$/, '');

// In-Memory Access Token Storage (Never in localStorage for security)
let memoryAccessToken: string | null = null;

export const getAccessToken = (): string | null => memoryAccessToken;
export const setAccessToken = (token: string | null): void => {
  memoryAccessToken = token;
};

// Create Axios Instance
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send and receive HttpOnly cookies across requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token from memory if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (memoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Queue management for concurrency during token refresh
let isRefreshing = false;
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle 401 Unauthorized with Token Refresh & Rotation Queue
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/pre-login');

    // Attempt token refresh on 401 Unauthorized for non-auth requests
    if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue parallel requests until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call backend token refresh endpoint (HttpOnly cookie automatically attached)
        const response = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);

        // Process all queued requests with the new token
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (cookie expired, missing, or token reuse detected)
        processQueue(refreshError, null);
        setAccessToken(null);

        // Broadcast global logout event to clear UI state
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('keyper:unauthorized'));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
