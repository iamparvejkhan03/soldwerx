import { io } from "socket.io-client";

// Match the base URL your axiosInstance uses.
// Replace VITE_DOMAIN_URL with whatever env var your axiosInstance uses.
const SOCKET_URL =
    import.meta.env.VITE_DOMAIN_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
});