import axios from 'axios';

const API = axios.create({
  baseURL:import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', // Apne backend ka exact port/route check kar lena
});

// Automatically attaches Authorization header if token exists in localStorage
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;