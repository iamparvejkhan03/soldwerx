import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

let ioInstance = null;

export const setIO = (io) => {
    ioInstance = io;
};

export const getIO = () => ioInstance;

// ─────────────────────────────────────────────────────────────
// Socket auth middleware
// Runs once per handshake. Verifies the accessToken cookie (or
// auth.token fallback). Anonymous users are allowed — they simply
// don't get a personal room.
// ─────────────────────────────────────────────────────────────

const parseCookieToken = (cookieHeader, cookieName = "accessToken") => {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(";");
    for (const part of parts) {
        const [key, ...rest] = part.trim().split("=");
        if (key === cookieName) {
            return decodeURIComponent(rest.join("="));
        }
    }
    return null;
};

export const authenticateSocket = async (socket, next) => {
    try {
        // 1. Primary: auth payload sent by the client
        const authToken = socket.handshake.auth?.token;

        // 2. Fallbacks: cookie / Authorization header
        const cookieToken = parseCookieToken(socket.handshake.headers.cookie, "accessToken");
        const refreshCookieToken = parseCookieToken(socket.handshake.headers.cookie, "refreshToken");
        const headerToken = socket.handshake.headers?.authorization?.replace("Bearer ", "");

        let decoded = null;

        // Try access token from any source first
        const accessCandidate = authToken || cookieToken || headerToken;
        if (accessCandidate) {
            try {
                decoded = jwt.verify(accessCandidate, process.env.ACCESS_TOKEN_SECRET);
            } catch (_) { /* fall through to refresh token */ }
        }

        // Fallback: refresh token (30-day life). Handles page reload
        // after the 15-minute access token has expired.
        if (!decoded && refreshCookieToken) {
            try {
                decoded = jwt.verify(refreshCookieToken, process.env.REFRESH_TOKEN_SECRET);
            } catch (_) { /* both failed — anonymous */ }
        }

        if (!decoded) {
            socket.user = null;
            return next();
        }

        const user = await User.findById(decoded.id)
            .select("_id userType permissions isActive")
            .lean();

        if (!user || !user.isActive) {
            socket.user = null;
            return next();
        }

        socket.user = {
            _id: user._id.toString(),
            userType: user.userType,
            permissions: user.permissions || [],
        };
        next();
    } catch (err) {
        socket.user = null;
        next();
    }
};

// ─────────────────────────────────────────────────────────────
// Room wiring
// ─────────────────────────────────────────────────────────────

export const attachSocketHandlers = (io) => {
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        // Global feed — auction ticks etc.
        socket.join('global');

        // Personal room for notifications, if authenticated
        if (socket.user?._id) {
            socket.join(`user:${socket.user._id}`);
        }

        // Existing auction room handlers
        socket.on('joinAuction', (id) => {
            if (id) socket.join(`auction:${id}`);
        });
        socket.on('leaveAuction', (id) => {
            if (id) socket.leave(`auction:${id}`);
        });

        // Optional: client can request a fresh count on demand
        socket.on('notification:request-count', async () => {
            if (!socket.user?._id) return;
            try {
                const { default: Notification } = await import('../models/notification.model.js');
                const unreadCount = await Notification.getUnreadCount(socket.user._id);
                socket.emit('notification:count', {
                    unreadCount,
                    serverTime: Date.now(),
                });
            } catch (_) { /* ignore */ }
        });

        socket.on('joinCommunication', (id) => {
            if (id) socket.join(`communication:${id}`);
        });
        socket.on('leaveCommunication', (id) => {
            if (id) socket.leave(`communication:${id}`);
        });
    });
};