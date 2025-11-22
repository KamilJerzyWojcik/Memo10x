import { getAuthToken } from '../utils/auth';
import { supabase } from './supabase';
 
 type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
 
 export interface ApiRequestOptions extends RequestInit {
   json?: unknown;
 }
 
 export class ApiError extends Error {
   public readonly status: number;
   public readonly responseText: string;
   constructor(status: number, message: string, responseText: string) {
     super(message);
     this.name = 'ApiError';
     this.status = status;
     this.responseText = responseText;
   }
 }
 
 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
 
 function buildUrl(path: string): string {
   return `${API_BASE_URL}${path}`;
 }
 
 function redirectToLogin() {
   const returnUrl = `${window.location.pathname}${window.location.search}`;
   const target = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
   window.location.assign(target);
 }
 
async function apiRequest<TResponse>(path: string, method: HttpMethod, options?: ApiRequestOptions): Promise<TResponse> {
   const url = buildUrl(path);
   const headers = new Headers(options?.headers ?? {});
 
   if (!headers.has('Content-Type') && options?.json !== undefined) {
     headers.set('Content-Type', 'application/json');
   }
 
  // Pobierz świeży token z Supabase; fallback do localStorage
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
 
   const response = await fetch(url, {
     ...options,
     method,
     headers,
     body: options?.json !== undefined ? JSON.stringify(options.json) : options?.body,
   });
 
   if (response.status === 401) {
     redirectToLogin();
     throw new ApiError(401, 'Unauthorized', '');
   }
 
   if (!response.ok) {
     const text = await response.text().catch(() => '');
     throw new ApiError(response.status, text || `HTTP ${response.status}`, text);
   }
 
   // Return 204 for DELETE-no-content etc.
   if (response.status === 204) {
     return undefined as unknown as TResponse;
   }
 
   const contentType = response.headers.get('Content-Type') ?? '';
   if (contentType.includes('application/json')) {
     return response.json() as Promise<TResponse>;
   }
   // Fallback to text
   const txt = await response.text();
   return txt as unknown as TResponse;
 }
 
 export const apiClient = {
   get: <T>(path: string, options?: ApiRequestOptions) => apiRequest<T>(path, 'GET', options),
   post: <T>(path: string, options?: ApiRequestOptions) => apiRequest<T>(path, 'POST', options),
   patch: <T>(path: string, options?: ApiRequestOptions) => apiRequest<T>(path, 'PATCH', options),
   delete: <T>(path: string, options?: ApiRequestOptions) => apiRequest<T>(path, 'DELETE', options),
 };
 
 
 