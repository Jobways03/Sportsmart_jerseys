// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://bcl-usyn.onrender.com", // Vite will proxy /api → http://localhost:8000 https://bcl-usyn.onrender.com
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
