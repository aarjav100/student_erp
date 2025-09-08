// Lightweight fetch-based client that mimics the small subset of axios used in the app

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  headers?: Record<string, string>;
  body?: any;
};

async function request<T>(method: HttpMethod, url: string, options: RequestOptions = {}): Promise<{ data: T }>
{
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = headers['Authorization'] || `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http')
    ? url
    : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  });

  let parsed: any = null;
  const text = await res.text();
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text as any; }

  if (!res.ok) {
    // Provide axios-like error shape
    const error: any = new Error('Request failed');
    error.response = { status: res.status, data: parsed };
    throw error;
  }

  return { data: parsed as T };
}

const client = {
  get: <T = any>(url: string, opts?: { headers?: Record<string, string> }) =>
    request<T>('GET', url, { headers: opts?.headers }),
  post: <T = any>(url: string, body?: any, opts?: { headers?: Record<string, string> }) =>
    request<T>('POST', url, { body, headers: opts?.headers }),
  put: <T = any>(url: string, body?: any, opts?: { headers?: Record<string, string> }) =>
    request<T>('PUT', url, { body, headers: opts?.headers }),
  patch: <T = any>(url: string, body?: any, opts?: { headers?: Record<string, string> }) =>
    request<T>('PATCH', url, { body, headers: opts?.headers }),
  delete: <T = any>(url: string, opts?: { headers?: Record<string, string> }) =>
    request<T>('DELETE', url, { headers: opts?.headers }),
};

export default client;