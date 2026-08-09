import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Also attach bearer token from localStorage as a fallback for environments
// where third-party cookies are restricted (e.g. some mobile webviews).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('upi_relay_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
