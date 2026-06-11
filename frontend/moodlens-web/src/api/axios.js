import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:7266/api", // đổi theo backend của bạn
    // baseURL: "https://gurgling-annotate-superjet.ngrok-free.dev/api",
});

// attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;