import { useEffect, useState } from "react";
import {
  getServerNow,
  ensureClockStarted,
  subscribeToClock,
} from "../utils/serverClock";

const INITIAL = {
  days: "00",
  hours: "00",
  minutes: "00",
  seconds: "00",
  status: "loading",
};

const pad2 = (n) => String(Math.max(0, n)).padStart(2, "0");

const buildFromMs = (ms) => ({
  days: pad2(Math.floor(ms / 86400000)),
  hours: pad2(Math.floor((ms / 3600000) % 24)),
  minutes: pad2(Math.floor((ms / 60000) % 60)),
  seconds: pad2(Math.floor((ms / 1000) % 60)),
});

/**
 * Pure computation. `nowMs` comes from the server-aligned clock,
 * NOT from the local device.
 */
const computeCountdown = (auction, nowMs) => {
  if (!auction) return INITIAL;

  const startMs = new Date(auction.startDate).getTime();
  const endMs = new Date(auction.endDate).getTime();

  // ===== ALWAYS AVAILABLE (buy_now, giveaway) =====
  if (auction.auctionType === "buy_now" || auction.auctionType === "giveaway") {
    if (auction.winner) {
      return {
        days: "00", hours: "00", minutes: "00", seconds: "00",
        status: auction.auctionType === "buy_now" ? "purchased" : "claimed",
      };
    }
    return {
      days: "00", hours: "00", minutes: "00", seconds: "00",
      status: "always-available",
    };
  }

  // ===== TIMED AUCTIONS =====
  if (auction.status === "approved") {
    if (nowMs >= startMs) {
      return { ...buildFromMs(endMs - nowMs), status: "counting-down" };
    }
    return { ...buildFromMs(startMs - nowMs), status: "approved" };
  }

  if (auction.status === "draft") {
    return { ...INITIAL, status: "draft" };
  }

  if (auction.status === "cancelled" || auction.status === "suspended") {
    return { ...INITIAL, status: auction.status };
  }

  if (auction.status === "active") {
    if (nowMs >= endMs) {
      return { ...INITIAL, status: "ended" };
    }
    return { ...buildFromMs(endMs - nowMs), status: "counting-down" };
  }

  if (["ended", "reserve_not_met", "sold", "sold_buy_now"].includes(auction.status)) {
    return { ...INITIAL, status: "ended" };
  }

  return { ...INITIAL, status: auction.status || "unknown" };
};

// Only these states actually change second-to-second.
const needsTicking = (auction) => {
  if (!auction) return false;
  if (auction.auctionType === "buy_now" || auction.auctionType === "giveaway") {
    return false;
  }
  return auction.status === "approved" || auction.status === "active";
};

const useAuctionCountdown = (auction) => {
  const [countdown, setCountdown] = useState(INITIAL);

  // Kick off the site-wide clock once, on first use.
  useEffect(() => {
    ensureClockStarted();
  }, []);

  useEffect(() => {
    if (!auction) {
      setCountdown(INITIAL);
      return;
    }

    const update = () =>
      setCountdown(computeCountdown(auction, getServerNow()));

    // Immediate paint.
    update();

    // Recompute whenever the clock offset changes (sync, reanchor, etc.).
    const unsubscribe = subscribeToClock(update);

    // While the auction is live, also tick at 250 ms — this hides
    // any residual interval drift and makes the displayed second
    // flip within ±250 ms of the true boundary.
    let tickId = null;
    if (needsTicking(auction)) {
      tickId = setInterval(update, 250);
    }

    return () => {
      unsubscribe();
      if (tickId) clearInterval(tickId);
    };
  }, [auction]);

  return countdown;
};

export default useAuctionCountdown;