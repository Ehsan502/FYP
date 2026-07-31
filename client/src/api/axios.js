import axios from "axios";

// Netlify par auto live Vercel backend pakdega, local par /api proxy chalega!
const BASE_URL = import.meta.env.PROD
  ? "https://fyp-ashen-kappa.vercel.app/api"
  : "/api";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("skillswap_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;