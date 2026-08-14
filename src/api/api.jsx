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

export const getErrorMessage = (err, fallback = "Operation failed") => {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  const responseData = err.response?.data;
  if (!responseData) {
    return err.message || fallback;
  }

  if (typeof responseData === "string") return responseData;
  if (responseData.error && typeof responseData.error === "string") return responseData.error;
  if (responseData.message && typeof responseData.message === "string") return responseData.message;
  if (responseData.detail && typeof responseData.detail === "string") return responseData.detail;

  if (typeof responseData === "object") {
    const errorMessages = [];
    for (const [key, val] of Object.entries(responseData)) {
      const fieldLabel = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      if (Array.isArray(val)) {
        errorMessages.push(`${fieldLabel}: ${val.join(", ")}`);
      } else if (typeof val === "string") {
        errorMessages.push(`${fieldLabel}: ${val}`);
      } else if (typeof val === "object" && val !== null) {
        errorMessages.push(`${fieldLabel}: ${JSON.stringify(val)}`);
      }
    }
    if (errorMessages.length > 0) {
      return errorMessages.join(" | ");
    }
  }

  return fallback;
};

export default api;
