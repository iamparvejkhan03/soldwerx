import { useEffect } from "react";
import { socket } from "../utils/socket";
import {
    ensureClockStarted,
    reanchorFromSocket,
} from "../utils/serverClock";

export function useLiveAuctionTicks(setAuctions) {
    useEffect(() => {
        ensureClockStarted();

        const onTick = ({ serverTime, ...tick }) => {
            // Nudge the site-wide clock with the server's stamp.
            if (serverTime) reanchorFromSocket(serverTime);

            setAuctions((prev) => {
                if (!Array.isArray(prev) || prev.length === 0) return prev;
                const idx = prev.findIndex((a) => a._id === tick._id);
                if (idx === -1) return prev; // not on this page
                const next = prev.slice();
                next[idx] = { ...next[idx], ...tick };
                return next;
            });
        };

        const onRemoved = ({ _id }) => {
            setAuctions((prev) =>
                Array.isArray(prev)
                    ? prev.filter((a) => a._id !== _id)
                    : prev
            );
        };

        socket.on("auction:tick", onTick);
        socket.on("auction:removed", onRemoved);

        return () => {
            socket.off("auction:tick", onTick);
            socket.off("auction:removed", onRemoved);
        };
    }, [setAuctions]);
}