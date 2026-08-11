import axios from "axios";


const api = axios.create({
  // baseURL: "http://127.0.0.1:8000/",
  baseURL: "https://work-track-management-backend-g5cu.onrender.com",

  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/login/")) {
      console.warn("Unauthorized! Clearing session...");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    }
    return Promise.reject(error);
  }
);

export default api;
