import { io } from "socket.io-client";
import { ensureClockStarted, syncWithServer } from "./serverClock";

const SOCKET_URL =
  import.meta.env.VITE_DOMAIN_URL || "http://localhost:3000";

// ─────────────────────────────────────────────────────────────
// Read the current access token at module init. This covers the
// "returning visitor" case — they already logged in on a previous
// page load, so localStorage has a token by the time this runs.
// ─────────────────────────────────────────────────────────────
const initialToken = (() => {
  try { return localStorage.getItem("accessToken") || null; }
  catch { return null; }
})();

export const socket = io(SOCKET_URL, {
  withCredentials: true,

  // Sent in the Socket.IO handshake payload.
  // Backend reads this via `socket.handshake.auth.token`.
  auth: { token: initialToken },

  transports: ["websocket", "polling"],

  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 3000,
  randomizationFactor: 0.3,
  timeout: 10000,

  autoConnect: true,
});

// ─────────────────────────────────────────────────────────────
// Auth token updater
//
// Call this after login (with the new access token), after silent
// token refresh, and after logout (with null).
//
// By default we DO NOT reconnect — this is safe for the token-refresh
// case where the socket is already authenticated on the server and
// we only want the *next* reconnect to carry the new token.
//
// Pass { reconnect: true } after login/logout, where the identity
// actually changed and we need a fresh handshake RIGHT NOW.
// ─────────────────────────────────────────────────────────────
export const updateSocketAuth = (newToken, { reconnect = false } = {}) => {
  try {
    socket.auth = { token: newToken || null };

    if (reconnect) {
      try { socket.disconnect(); } catch (_) { }
      // Brief delay so the server has time to drop the old socket
      // before we open a new one with the same browser session.
      setTimeout(() => {
        try { socket.connect(); } catch (_) { }
      }, 120);
    }
  } catch (_) { /* silent */ }
};

// ─────────────────────────────────────────────────────────────
// Everything below this line is UNCHANGED from your current file.
// ─────────────────────────────────────────────────────────────

let lastServerEventAt = Date.now();
const markServerEvent = () => { lastServerEventAt = Date.now(); };

["auction:tick", "auction:update", "auction:removed"].forEach((evt) =>
  socket.on(evt, markServerEvent)
);
socket.io.on("ping", markServerEvent);

const SILENCE_LIMIT_MS = 40_000;
const WATCHDOG_INTERVAL_MS = 8_000;

const forceReconnect = (reason) => {
  try { socket.disconnect(); } catch (_) { }
  try { socket.connect(); } catch (_) { }
  lastServerEventAt = Date.now();
};

const runWatchdogCheck = () => {
  if (!socket.connected) {
    lastServerEventAt = Date.now();
    return;
  }
  const silence = Date.now() - lastServerEventAt;
  if (silence > SILENCE_LIMIT_MS) {
    forceReconnect(`silent for ${Math.round(silence / 1000)}s`);
  }
};

const watchdog = setInterval(runWatchdogCheck, WATCHDOG_INTERVAL_MS);

const onWake = (reason) => {
  if (typeof document !== "undefined" && document.hidden) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      forceReconnect(reason);
      syncWithServer();
      runWatchdogCheck();
    });
  });
};

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) onWake("visibilitychange");
  });

  document.addEventListener(
    "touchstart",
    () => {
      if (Date.now() - lastServerEventAt > 30_000) {
        onWake("touchstart");
      }
    },
    { passive: true }
  );
}

if (typeof window !== "undefined") {
  window.addEventListener("focus", () => onWake("focus"));
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) onWake("pageshow");
  });
  window.addEventListener("online", () => onWake("online"));
}

socket.on("connect", () => {
  lastServerEventAt = Date.now();
  ensureClockStarted();
  syncWithServer();
});

socket.on("disconnect", (reason) => {
  // console.info("[socket] disconnected:", reason);
});

const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

let mobileCycle = null;
if (isMobile) {
  mobileCycle = setInterval(() => {
    forceReconnect("periodic mobile refresh");
  }, 4 * 60 * 1000);
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearInterval(watchdog);
    if (mobileCycle) clearInterval(mobileCycle);
  });
}