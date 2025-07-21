import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to sign in on 401
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const apiService = {
  // Article generation
  generateArticle: async (data: { title: string; length: number }) => {
    const response = await api.post('/article', data);
    return response.data;
  },

  // Image generation
  generateImage: async (data: { prompt: string; style?: string; size?: string }) => {
    const response = await api.post('/image', data);
    return response.data;
  },

  // Background removal
  removeBackground: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/bg-remove', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Resume analysis
  analyzeResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post('/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // History
  getHistory: async (limit: number = 50) => {
    const response = await api.get(`/history?limit=${limit}`);
    return response.data;
  },
};