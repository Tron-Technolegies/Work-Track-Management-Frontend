import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/api";

/**
 * GlobalMonitoringTracker
 * =======================
 * Runs across the entire application while the user is logged in.
 * Whenever the user is clocked in:
 *   - Automatically records page transitions as Website Usage (user_app/start-website/)
 *   - Periodically logs Application Usage (user_app/start-application/)
 *   - Synchronizes with backend session status and custom clock-in/out events
 */
const GlobalMonitoringTracker = () => {
  const location = useLocation();
  const isClockedInRef = useRef(false);
  const isOnBreakRef = useRef(false);
  const periodicTimerRef = useRef(null);

  // Helper to determine browser name
  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Edg/")) return "Microsoft Edge";
    if (ua.includes("Chrome/")) return "Google Chrome";
    if (ua.includes("Firefox/")) return "Mozilla Firefox";
    if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Apple Safari";
    return "Web Browser";
  };

  // Helper to get formatted page title
  const getFormattedTitle = () => {
    const rawTitle = document.title || "Work Track";
    const path = location.pathname.replace("/user/", "").replace("/", " - ") || "Dashboard";
    const formatted = path.charAt(0).toUpperCase() + path.slice(1);
    return `${rawTitle} | ${formatted}`;
  };

  // Log active website usage
  const logWebsiteUsage = async () => {
    if (!isClockedInRef.current || isOnBreakRef.current) return;
    const userRole = localStorage.getItem("user_role") || "";
    if (userRole === "admin" || userRole === "super_admin") return;

    try {
      await api.post("user_app/start-website/", {
        browser_name: getBrowserName(),
        website: window.location.host || "worktrack.local",
        page_title: getFormattedTitle(),
      });
    } catch (err) {
      // Silently ignore or debug log
      console.debug("Website tracking ping:", err?.response?.data?.message || err.message);
    }
  };

  // Log active application usage
  const logApplicationUsage = async () => {
    if (!isClockedInRef.current || isOnBreakRef.current) return;
    const userRole = localStorage.getItem("user_role") || "";
    if (userRole === "admin" || userRole === "super_admin") return;

    try {
      await api.post("user_app/start-application/", {
        application_name: "Work Track Web App",
        window_title: getFormattedTitle(),
      });
    } catch (err) {
      console.debug("App tracking ping:", err?.response?.data?.message || err.message);
    }
  };

  // Check current clock-in session status from backend
  const checkSessionStatus = async () => {
    const userRole = localStorage.getItem("user_role") || "";
    if (userRole === "admin" || userRole === "super_admin") return;

    try {
      const res = await api.get("user_app/current-session/");
      const clockedIn = !!res.data?.clocked_in;
      const onBreak = !!res.data?.is_on_break;
      isClockedInRef.current = clockedIn;
      isOnBreakRef.current = onBreak;

      if (clockedIn && !onBreak) {
        logWebsiteUsage();
        logApplicationUsage();
      }
    } catch {
      // If error (e.g. unauthenticated), mark as false
      isClockedInRef.current = false;
      isOnBreakRef.current = false;
    }
  };

  // Initial check & periodic session poll
  useEffect(() => {
    checkSessionStatus();

    // Event listeners for clock-in, clock-out, break-start, break-end
    const handleClockIn = () => {
      isClockedInRef.current = true;
      isOnBreakRef.current = false;
      logWebsiteUsage();
      logApplicationUsage();
    };

    const handleClockOut = () => {
      isClockedInRef.current = false;
      isOnBreakRef.current = false;
    };

    const handleBreakStart = () => {
      isOnBreakRef.current = true;
    };

    const handleBreakEnd = () => {
      isOnBreakRef.current = false;
      logWebsiteUsage();
      logApplicationUsage();
    };

    window.addEventListener("worktrack:clock-in", handleClockIn);
    window.addEventListener("worktrack:clock-out", handleClockOut);
    window.addEventListener("worktrack:break-start", handleBreakStart);
    window.addEventListener("worktrack:break-end", handleBreakEnd);

    // Periodic heartbeat every 60 seconds
    periodicTimerRef.current = setInterval(() => {
      if (isClockedInRef.current && !isOnBreakRef.current) {
        logWebsiteUsage();
        logApplicationUsage();
      }
    }, 60000);

    return () => {
      window.removeEventListener("worktrack:clock-in", handleClockIn);
      window.removeEventListener("worktrack:clock-out", handleClockOut);
      window.removeEventListener("worktrack:break-start", handleBreakStart);
      window.removeEventListener("worktrack:break-end", handleBreakEnd);
      if (periodicTimerRef.current) clearInterval(periodicTimerRef.current);
    };
  }, []);

  // Track page / route navigation
  useEffect(() => {
    if (isClockedInRef.current) {
      logWebsiteUsage();
      logApplicationUsage();
    }
  }, [location.pathname]);

  return null; // Headless component
};

export default GlobalMonitoringTracker;
