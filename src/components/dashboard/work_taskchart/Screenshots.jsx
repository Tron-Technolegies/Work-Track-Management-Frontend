import React, { useEffect, useState } from "react";
import "./Screenshots.css";
import { FiImage, FiX, FiAlertTriangle } from "react-icons/fi";
import api from "../../../api/api";

function Screenshots() {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  useEffect(() => {
    fetchScreenshots();

    const interval = setInterval(() => {
      fetchScreenshots();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

const fetchScreenshots = async () => {
  try {
    setLoading(true);

    const role = localStorage.getItem("role");

    const endpoint =
      role === "admin" || role === "super_admin"
        ? "admin_app/screenshots/"
        : "user_app/my-screenshots/";

    const res = await api.get(endpoint);

    const list = Array.isArray(res.data)
      ? res.data
      : res.data?.results || [];

    setScreenshots(list);
  } catch (err) {
    console.error("Failed to load screenshots:", err);
  } finally {
    setLoading(false);
  }
};

  const formatTime = (capturedAt) => {
    if (!capturedAt) return "-";
    try {
      return new Date(capturedAt).toLocaleString([], {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return capturedAt;
    }
  };

  /**
   * Build a high-quality Cloudinary URL.
   * The serializer already returns full https URLs — we inject quality transforms.
   */
  const getImageUrl = (img) => {
    if (!img || typeof img !== "string") return null;

    if (img.startsWith("http://") || img.startsWith("https://")) {
      if (img.includes("res.cloudinary.com")) {
        if (!img.includes("/f_auto") && !img.includes("/q_auto")) {
          return img.replace(
            /\/upload\//,
            "/upload/f_auto,q_auto:best/"
          );
        }
      }

      return img;
    }

    if (img.startsWith("data:")) return img;

    const backendBase = api.defaults.baseURL?.replace(/\/+$/, "");

    return `${backendBase}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  const getReasonBadge = (reason) => {
    if (reason === "blocked_app") {
      return (
        <span
          style={{
            background: "#ef4444",
            color: "#fff",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            letterSpacing: "0.3px",
          }}
        >
          <FiAlertTriangle size={11} /> BLOCKED APP
        </span>
      );
    }
    if (reason === "periodic") {
      return (
        <span
          style={{
            background: "#3b82f6",
            color: "#fff",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          periodic_monitoring
        </span>
      );
    }
    if (reason) {
      return (
        <span
          style={{
            background: "#6b7280",
            color: "#fff",
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "11px",
          }}
        >
          {reason}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="screenshots-container">
      <h3 className="screenshots-title">Captured Screenshots</h3>

      {loading ? (
        <p style={{ padding: "20px", color: "#94a3b8" }}>Loading screenshots...</p>
      ) : screenshots.length === 0 ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
          <FiImage size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
          <p>No desktop screenshots recorded yet</p>
        </div>
      ) : (
        <div className="screenshots-grid">
          {screenshots.map((item) => {
            const imgUrl = getImageUrl(item.image);
            const empName =
              item.employee_name ||
              item.name ||
              item.user?.first_name ||
              item.user?.username ||
              item.email ||
              "Employee";
            const isBlocked = item.reason === "blocked_app";

            return (
              <div
                className="screenshot-card"
                key={item.id}
                onClick={() =>
                  setSelectedScreenshot({ ...item, fullUrl: imgUrl, empName })
                }
                style={{
                  cursor: "pointer",
                  position: "relative",
                  outline: isBlocked ? "3px solid #ef4444" : undefined,
                  outlineOffset: isBlocked ? "-3px" : undefined,
                }}
              >
                <div className="screenshot-image" style={{ position: "relative" }}>
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={empName}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextSibling) {
                          e.currentTarget.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="placeholder"
                    style={{ display: imgUrl ? "none" : "flex" }}
                  >
                    <FiImage className="placeholder-icon" />
                  </div>

                  {/* Blocked app badge overlay on top-left of image */}
                  {isBlocked && (
                    <div
                      style={{
                        position: "absolute",
                        top: 7,
                        left: 7,
                        zIndex: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "#ef4444",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        boxShadow: "0 2px 6px rgba(239,68,68,0.5)",
                      }}
                    >
                      <FiAlertTriangle size={11} /> BLOCKED APP
                    </div>
                  )}
                </div>

                <div className="screenshot-info">
                  <h4>{empName}</h4>
                  <p>{formatTime(item.captured_at)}</p>
                  {getReasonBadge(item.reason)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedScreenshot && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.88)",
            zIndex: 999999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "85%",
              background: "#1e293b",
              padding: "16px",
              borderRadius: "16px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
              border:
                selectedScreenshot.reason === "blocked_app"
                  ? "2px solid #ef4444"
                  : "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#fff",
                marginBottom: "12px",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h4 style={{ margin: 0, fontSize: "16px" }}>
                  {selectedScreenshot.empName}
                </h4>
                {selectedScreenshot.reason === "blocked_app" && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FiAlertTriangle size={11} /> BLOCKED APP DETECTED
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedScreenshot(null)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FiX />
              </button>
            </div>

            {selectedScreenshot.fullUrl ? (
              <img
                src={selectedScreenshot.fullUrl}
                alt="Screenshot Preview"
                style={{
                  width: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <div
                style={{ padding: "40px", color: "#94a3b8", textAlign: "center" }}
              >
                No image available
              </div>
            )}

            <div
              style={{
                marginTop: "12px",
                fontSize: "13px",
                color: "#94a3b8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Captured: {formatTime(selectedScreenshot.captured_at)}</span>
              {getReasonBadge(selectedScreenshot.reason)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Screenshots;