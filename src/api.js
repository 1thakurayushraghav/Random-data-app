import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Response: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ Error:`, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const deviceAPI = {
  getAllDevices: () => api.get('/devices'),
  addDevice: (deviceData) => api.post('/devices', deviceData),
  storeCPCBDevice: (deviceData) => api.post('/devices/store-from-cpcb', deviceData),
  toggleDataSending: (deviceId) => api.patch(`/devices/${deviceId}/toggle-send`),
  deleteDevice: (deviceId) => api.delete(`/devices/${deviceId}`),
  getDataLogs: (deviceId) => api.get(`/data-logs?deviceId=${deviceId}`),
  triggerScheduler: () => api.post('/scheduler/trigger'),
};

export default api;