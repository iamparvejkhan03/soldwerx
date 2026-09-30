import { io } from "socket.io-client";
import { ensureClockStarted, syncWithServer } from "./serverClock";

const SOCKET_URL =
    import.meta.env.VITE_DOMAIN_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
});

// Socket connects (initial or after a drop) — make sure the clock is
// synced. This covers the case where the tab was offline for a while.
socket.on("connect", () => {
    ensureClockStarted();
    syncWithServer();
});