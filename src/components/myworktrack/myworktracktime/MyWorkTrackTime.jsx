import React, { useState, useEffect, useRef } from "react";
import "./MyWorkTrackTime.css";
import MyProgressChart from "../myworktracktime/myprogresschart/MyProgressChart";
import MyFocusTimer from "../myworktracktime/myfocustimer/MyFocusTimer";
import MyWorkCard from "../myworktracktime/myworkcard/MyWorkCard";
import MyBreakCard from "../myworktracktime/mybreakcard/MyBreakCard";
import MyTimeInfo from "../myworktracktime/mytimeinfo/MyTimeInfo";
import MyEfficiencyCard from "../myworktracktime/myefficiencycard/MyEfficiencyCard";
import api from "../../../api/api";
import { toast } from "react-toastify";
import { FiLock } from "react-icons/fi";

function MyWorkTrackTime() {
  const [clockedIn, setClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clockInTime, setClockInTime] = useState("--:--");
  const [clockOutTime, setClockOutTime] = useState("--:--");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);

  const timerRef = useRef(null);

  // ── Access control ──────────────────────────────────────────────
  const userRole = localStorage.getItem("user_role") || "";
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  useEffect(() => {
    if (isAdmin) return; // Don't fetch sessions for admins
    fetchCurrentSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Live timer effect & Automated Background Monitoring
  useEffect(() => {
    if (isAdmin) return;

    let screenshotTimer = null;
    let trackingTimer = null;

    if (clockedIn) {
      // 1. Timer for elapsed seconds
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // 2. Fetch company monitoring settings and start monitoring
      const startMonitoring = async () => {
        try {
          const settingsRes = await api.get("user_app/monitoring-settings/");
          const settings = settingsRes.data || {};
          const screenshotIntervalMs = Math.max(30, settings.screenshot_interval || 300) * 1000;

          // Automated Screenshot Capture
          if (settings.screenshot_enabled !== false) {
            const captureAndUploadScreenshot = async () => {
              try {
                // Create a canvas representation
                const canvas = document.createElement("canvas");
                canvas.width = 600;
                canvas.height = 360;
                const ctx = canvas.getContext("2d");

                // Draw background & UI snapshot info
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#38bdf8";
                ctx.font = "bold 20px sans-serif";
                ctx.fillText("Work Track Monitoring Snapshot", 40, 60);

                ctx.fillStyle = "#94a3b8";
                ctx.font = "14px sans-serif";
                ctx.fillText(`Timestamp: ${new Date().toLocaleString()}`, 40, 100);
                ctx.fillText(`Window Title: ${document.title || "Work Track User Dashboard"}`, 40, 130);
                ctx.fillText(`Active URL: ${window.location.href}`, 40, 160);
                ctx.fillText(`Status: User Clocked In & Working`, 40, 190);

                ctx.fillStyle = "#10b981";
                ctx.fillRect(40, 230, 520, 4);
                ctx.fillStyle = "#cbd5e1";
                ctx.font = "12px sans-serif";
                ctx.fillText("Automated monitoring active as per company security policy", 40, 260);

                const dataUrl = canvas.toDataURL("image/png");
                await api.post("user_app/upload-screenshot/", {
                  image: dataUrl,
                  reason: "periodic_monitoring",
                });
              } catch (err) {
                console.warn("Screenshot auto-capture failed:", err);
              }
            };

            // Capture initial & start interval
            captureAndUploadScreenshot();
            screenshotTimer = setInterval(captureAndUploadScreenshot, screenshotIntervalMs);
          }

          // Automated Website & Application Tracking
          if (settings.website_tracking_enabled !== false || settings.app_tracking_enabled !== false) {
            const logTrackingActivity = async () => {
              try {
                if (settings.app_tracking_enabled !== false) {
                  await api.post("user_app/start-application/", {
                    application_name: "Work Track Web App",
                    window_title: document.title || "User Work Track",
                  });
                }
                if (settings.website_tracking_enabled !== false) {
                  await api.post("user_app/start-website/", {
                    browser_name: navigator.userAgent.includes("Chrome") ? "Chrome" : "Browser",
                    website: window.location.host || "localhost",
                    page_title: document.title || "Work Track",
                  });
                }
              } catch (err) {
                console.warn("Tracking activity log failed:", err);
              }
            };

            logTrackingActivity();
            trackingTimer = setInterval(logTrackingActivity, 120000); // every 2 mins
          }
        } catch (err) {
          console.warn("Could not fetch monitoring settings:", err);
        }
      };

      startMonitoring();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (screenshotTimer) clearInterval(screenshotTimer);
      if (trackingTimer) clearInterval(trackingTimer);
    };
  }, [clockedIn]);

  const formatTimeStr = (isoString) => {
    if (!isoString) return "--:--";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  };

  const fetchCurrentSession = async () => {
    try {
      const res = await api.get("user_app/current-session/");
      if (res.data?.clocked_in) {
        setClockedIn(true);
        const data = res.data.data;
        if (data?.clock_in) {
          setClockInTime(formatTimeStr(data.clock_in));
        }
        if (res.data.elapsed_seconds) {
          setElapsedSeconds(res.data.elapsed_seconds);
        }
      } else {
        setClockedIn(false);
      }
    } catch (err) {
      console.error("Error fetching current session:", err);
    }
  };

  const handleToggleClock = async () => {
    if (isAdmin) {
      toast.error("You do not have permission to clock in or out. This feature is for employees only.");
      return;
    }
    try {
      setLoading(true);
      if (!clockedIn) {
        // Clock In
        const res = await api.post("user_app/clock-in/");
        if (res.data?.success) {
          toast.success(res.data.message || "Clock In Successful!");
          setClockedIn(true);
          const data = res.data.data;
          if (data?.clock_in) {
            setClockInTime(formatTimeStr(data.clock_in));
          } else {
            setClockInTime(formatTimeStr(new Date().toISOString()));
          }
          setClockOutTime("--:--");
          setElapsedSeconds(0);
        }
      } else {
        // Clock Out
        const res = await api.post("user_app/clock-out/");
        if (res.data?.success) {
          toast.success(res.data.message || "Clock Out Successful!");
          setClockedIn(false);
          setIsOnBreak(false);
          const data = res.data.data;
          if (data?.clock_out) {
            setClockOutTime(formatTimeStr(data.clock_out));
          } else {
            setClockOutTime(formatTimeStr(new Date().toISOString()));
          }
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to update clock status";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBreak = async () => {
    if (isAdmin) {
      toast.error("Admins cannot start or end break sessions.");
      return;
    }
    try {
      if (!isOnBreak) {
        const res = await api.post("user_app/start-idle/");
        if (res.data?.success) {
          toast.success("Break session started");
          setIsOnBreak(true);
        }
      } else {
        const res = await api.post("user_app/end-idle/");
        if (res.data?.success) {
          toast.success("Break session ended");
          setIsOnBreak(false);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update break status";
      toast.error(msg);
    }
  };

  // ── Admin sees permission-denied panel ──────────────────────────
  if (isAdmin) {
    return (
      <div className="worktrack-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "340px" }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          padding: "48px 40px",
          background: "linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%)",
          border: "1px solid #fecaca",
          borderRadius: "20px",
          textAlign: "center",
          maxWidth: "440px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(239, 68, 68, 0.08)",
        }}>
          <div style={{
            width: "64px", height: "64px",
            background: "#fee2e2", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#dc2626",
          }}>
            <FiLock size={28} />
          </div>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#991b1b" }}>
            Access Restricted
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#7f1d1d", lineHeight: "1.6" }}>
            <strong>Clock In / Clock Out</strong> is only available to employees.<br />
            Admins can view employee attendance reports from the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="worktrack-container">
      <div className="progress-section">
        <MyProgressChart elapsedSeconds={elapsedSeconds} breakSeconds={breakSeconds} />
      </div>

      <div className="focus-section">
        <MyFocusTimer elapsedSeconds={elapsedSeconds} />
      </div>

      <div className="cards-section">
        <MyWorkCard clockedIn={clockedIn} onToggleClock={handleToggleClock} loading={loading} />
        <MyBreakCard isOnBreak={isOnBreak} onToggleBreak={handleToggleBreak} clockedIn={clockedIn} />
      </div>

      <div className="time-section">
        <MyTimeInfo
          clockInTime={clockInTime}
          clockOutTime={clockOutTime}
          elapsedSeconds={elapsedSeconds}
          breakSeconds={breakSeconds}
        />
      </div>

      <div className="efficiency-section">
        <MyEfficiencyCard elapsedSeconds={elapsedSeconds} />
      </div>
    </div>
  );
}

export default MyWorkTrackTime;