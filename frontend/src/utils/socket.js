import { io } from "socket.io-client";
import { ensureClockStarted, syncWithServer } from "./serverClock";

const SOCKET_URL =
    import.meta.env.VITE_DOMAIN_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],

    // --- Reconnect tuning ---
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,       // 1s initial
    reconnectionDelayMax: 3000,    // cap at 3s instead of 5s default
    randomizationFactor: 0.3,
    timeout: 10000,

    autoConnect: true,
});

// ─────────────────────────────────────────────────────────────
// Watchdog: force reconnect if no server event for > 45s while
// the tab is visible. This is what catches the iOS/Android
// silent death where socket.connected stays true.
// ─────────────────────────────────────────────────────────────

let lastServerEventAt = Date.now();

const markServerEvent = () => {
    lastServerEventAt = Date.now();
};

// Any server → client event resets the timer.
// Add the ones your app uses; wildcard isn't supported in v4.
[
    "auction:tick",
    "auction:update",
    "auction:removed",
].forEach((evt) => socket.on(evt, markServerEvent));

// Also on every pong (socket.io's own heartbeat)
socket.io.on("ping", markServerEvent);

const SILENCE_LIMIT_MS = 45_000;      // 45s without a server event = dead
const WATCHDOG_INTERVAL_MS = 10_000;  // check every 10s

const forceReconnect = (reason) => {
    if (!socket.connected) return;
    console.warn(`[socket] force reconnect: ${reason}`);
    socket.disconnect();
    socket.connect();
};

const watchdog = setInterval(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    const silence = Date.now() - lastServerEventAt;
    if (silence > SILENCE_LIMIT_MS) {
        forceReconnect(`silent for ${Math.round(silence / 1000)}s`);
    }
}, WATCHDOG_INTERVAL_MS);

// ─────────────────────────────────────────────────────────────
// Reconnect immediately when the tab becomes visible again.
// Covers app-switch, screen-off-then-on, and background returns.
// ─────────────────────────────────────────────────────────────
if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            // Give the OS a moment to wake the radio before we poke it.
            setTimeout(() => {
                if (!socket.connected) {
                    socket.connect();
                } else {
                    // Looks connected but might be a zombie — force a clean cycle.
                    forceReconnect("visibilitychange");
                }
                syncWithServer();
            }, 300);
        }
    });
}

// ─────────────────────────────────────────────────────────────
// Existing hooks
// ─────────────────────────────────────────────────────────────
socket.on("connect", () => {
    lastServerEventAt = Date.now(); // reset watchdog on fresh connect
    ensureClockStarted();
    syncWithServer();
});

socket.on("disconnect", (reason) => {
    // Only log — reconnection is automatic
    console.info("[socket] disconnected:", reason);
});

// Prevent Vite HMR from leaking intervals during development
if (import.meta.hot) {
    import.meta.hot.dispose(() => clearInterval(watchdog));
}

// Append to socket.js
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

if (isMobile) {
    setInterval(() => {
        if (typeof document !== "undefined" && document.hidden) return;
        if (socket.connected) {
            forceReconnect("periodic mobile refresh");
        }
    }, 5 * 60 * 1000); // every 5 min
}