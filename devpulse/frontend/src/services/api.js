import axios from 'axios';

const API = axios.create({
  baseURL:import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (data) => API.post('/auth/login', data);
export const signupUser = (data) => API.post('/auth/signup', data);
export const fetchTasks = () => API.get('/tasks');
export const createTask = (taskData) => API.post('/tasks', taskData);
export const updateTaskStatus = (id, status) => API.put(`/tasks/${id}`, { status });
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const generateAISubtasks = (id) => API.post(`/tasks/${id}/ai-generate`);
export const toggleSubtask = (taskId, subtaskId) => API.put(`/tasks/${taskId}/subtasks/${subtaskId}`);

export default API;