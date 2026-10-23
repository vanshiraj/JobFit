import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/";

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // ignore in non-browser env
    }
    return config;
});

export const registerUser = async ({ name, email, password }) => {
    try {
        const res = await api.post("/api/auth/register", { name, email, password });
        if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
        }
        return res.data;
    } catch (error) {
        console.error("Register API error:", error);
        throw error;
    }
};

export const loginUser = async ({ emailOrName, password }) => {
    try {
        const res = await api.post("/api/auth/login", {
            emailOrName,
            password
        });
        if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
        }
        return res.data;
    } catch (error) {
        console.error("Login API error:", error);
        throw error;
    }
};

export async function logoutUser() {
    try {
        const res = await api.get("/api/auth/logout");
        localStorage.removeItem("token");
        return res.data;
    } catch (error) {
        localStorage.removeItem("token");
        console.error("Logout API error:", error);
        throw error;
    }
}

export async function getUser() {
    try {
        const res = await api.get("/api/auth/userdetails");
        return res.data;
    } catch (error) {
        // Return null for 401 unauthenticated
        return null;
    }
}