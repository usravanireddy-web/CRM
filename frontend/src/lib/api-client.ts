import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';
const client = axios.create({ baseURL: apiBaseUrl, headers: { 'Content-Type': 'application/json' } });
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('velvorax_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
client.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) window.dispatchEvent(new Event('velvorax:unauthorized'));
  return Promise.reject(error);
});

export type ApiPage<T> = { data: T[]; meta: { page: number; pageSize: number; total: number } };

export const api = {
  setToken(token: string | null) {
    if (token) localStorage.setItem('velvorax_access_token', token);
    else localStorage.removeItem('velvorax_access_token');
  },
  async get<T>(path: string): Promise<T> {
    const response = await client.get<{ data: T }>(path);
    return response.data.data;
  },
  async getPage<T>(path: string): Promise<ApiPage<T>> {
    const response = await client.get<{ data: T[]; meta: ApiPage<T>['meta'] }>(path);
    return { data: response.data.data, meta: response.data.meta };
  },
  async post<T>(path: string, data: unknown): Promise<T> {
    const response = await client.post<{ data: T }>(path, data);
    return response.data.data;
  },
  async patch<T>(path: string, data: unknown): Promise<T> {
    const response = await client.patch<{ data: T }>(path, data);
    return response.data.data;
  },
  async delete(path: string) { await client.delete(path); },
};

export function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.error?.message ?? 'Could not connect to the API. Check the backend is running.';
  return error instanceof Error ? error.message : 'Something went wrong';
}
