import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas"; // 1. Moved to the top
import api from "../../api/api";

const GlobalMonitoringTracker = () => {
  const location = useLocation();
  const isClockedInRef = useRef(false);
  const isOnBreakRef = useRef(false);
  const periodicTimerRef = useRef(null);
  const screenshotTimerRef = useRef(null);

  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Edg/")) return "Microsoft Edge";
    if (ua.includes("Chrome/")) return "Google Chrome";
    if (ua.includes("Firefox/")) return "Mozilla Firefox";
    if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Apple Safari";
    return "Web Browser";
  };

  const getFormattedTitle = () => {
    const rawTitle = document.title || "Work Track";
    const path = location.pathname.replace("/user/", "").replace("/", " - ") || "Dashboard";
    const formatted = path.charAt(0).toUpperCase() + path.slice(1);
    return `${rawTitle} | ${formatted}`;
  };

  // Screenshot capture and upload function
const captureAndUploadScreenshot = async (reason = "periodic") => {
  if (!isClockedInRef.current || isOnBreakRef.current) return;
  const userRole = localStorage.getItem("user_role") || "";
  if (userRole === "admin" || userRole === "super_admin") return;

  try {
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      scale: 0.75,
    });

    // 1. Generate Base64 Data URL expected by backend
    const base64Image = canvas.toDataURL("image/jpeg", 0.7);

    // 2. Send JSON payload
    await api.post("user_app/upload-screenshot/", {
      image: base64Image,
      captured_at: new Date().toISOString(),
      reason: reason,
    });

    console.log("✅ Screenshot captured & uploaded successfully");
  } catch (err) {
    console.debug("Screenshot upload failed:", err?.response?.data || err.message);
  }
};

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
      console.debug("Website tracking ping:", err?.response?.data?.message || err.message);
    }
  };

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
        captureAndUploadScreenshot("periodic"); // 2. Trigger on initial active session check
      }
    } catch {
      isClockedInRef.current = false;
      isOnBreakRef.current = false;
    }
  };

  useEffect(() => {
    checkSessionStatus();

    const handleClockIn = () => {
      isClockedInRef.current = true;
      isOnBreakRef.current = false;
      logWebsiteUsage();
      logApplicationUsage();
      captureAndUploadScreenshot("periodic"); // 3. Trigger immediately when clocked in
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
      captureAndUploadScreenshot("periodic");
    };

    window.addEventListener("worktrack:clock-in", handleClockIn);
    window.addEventListener("worktrack:clock-out", handleClockOut);
    window.addEventListener("worktrack:break-start", handleBreakStart);
    window.addEventListener("worktrack:break-end", handleBreakEnd);

    // Heartbeat every 60 seconds
    periodicTimerRef.current = setInterval(() => {
      if (isClockedInRef.current && !isOnBreakRef.current) {
        logWebsiteUsage();
        logApplicationUsage();
      }
    }, 60000);

    // Screenshot timer (every 5 minutes / 300 seconds)
    screenshotTimerRef.current = setInterval(() => {
      if (isClockedInRef.current && !isOnBreakRef.current) {
        captureAndUploadScreenshot("periodic"); // 4. Trigger periodically
      }
    }, 300000);

    return () => {
      window.removeEventListener("worktrack:clock-in", handleClockIn);
      window.removeEventListener("worktrack:clock-out", handleClockOut);
      window.removeEventListener("worktrack:break-start", handleBreakStart);
      window.removeEventListener("worktrack:break-end", handleBreakEnd);
      if (periodicTimerRef.current) clearInterval(periodicTimerRef.current);
      if (screenshotTimerRef.current) clearInterval(screenshotTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isClockedInRef.current) {
      logWebsiteUsage();
      logApplicationUsage();
    }
  }, [location.pathname]);

  return null;
};

export default GlobalMonitoringTracker;