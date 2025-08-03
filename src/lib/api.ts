// src/lib/api.ts (or wherever you keep it)
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 120000, // 2 minutes timeout for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set auth token - to be called from components with auth
export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// RESPONSE INTERCEPTOR: remove auto‐redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // simply re‐throw; let components decide what to do on 401
    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const apiService = {
  generateArticle: async (data: { title: string; length: number }) => {
    const response = await api.post('/article', data);
    return response.data;
  },
  generateImage: async (data: { prompt: string; style?: string; size?: string }) => {
    const response = await api.post('/image', data);
    return response.data;
  },
  removeBackground: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/bg-remove', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000, // 3 minutes for background removal
    });
    return response.data;
  },
  analyzeResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minutes for resume analysis
    });
    return response.data;
  },
  getHistory: async (limit = 50) => {
    const response = await api.get(`/history?limit=${limit}`);
    return response.data;
  },
  getUsage: async () => {
    const response = await api.get('/history/usage');
    return response.data;
  },
};
