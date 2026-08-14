import React, { useEffect, useState } from "react";
import "./Screenshots.css";
import { FiImage, FiX } from "react-icons/fi";
import api from "../../../api/api";

function Screenshots() {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await api.get("admin_app/screenshots/");
      } catch {
        res = await api.get("user_app/my-screenshots/");
      }

      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setScreenshots(list);
    } catch (err) {
      console.error("Failed to load screenshots", err);
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

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    const backendBase = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/+$/, "").replace(/\/admin_app|\/user_app/, "") : "http://127.0.0.1:8000";
    return `${backendBase}${img.startsWith("/") ? "" : "/"}${img}`;
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
            const empName = item.employee_name || item.name || item.user?.first_name || item.user?.username || item.email || "Employee";

            return (
              <div
                className="screenshot-card"
                key={item.id}
                onClick={() => setSelectedScreenshot({ ...item, fullUrl: imgUrl, empName })}
                style={{ cursor: "pointer" }}
              >
                <div className="screenshot-image">
                  {imgUrl ? (
                    <img src={imgUrl} alt={empName} />
                  ) : (
                    <div className="placeholder">
                      <FiImage className="placeholder-icon" />
                    </div>
                  )}
                </div>

                <div className="screenshot-info">
                  <h4>{empName}</h4>
                  <p>{formatTime(item.captured_at)}</p>
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
            background: "rgba(0,0,0,0.85)",
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
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", marginBottom: "12px" }}>
              <h4 style={{ margin: 0, fontSize: "16px" }}>{selectedScreenshot.empName}</h4>
              <button
                onClick={() => setSelectedScreenshot(null)}
                style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <FiX />
              </button>
            </div>
            {selectedScreenshot.fullUrl ? (
              <img
                src={selectedScreenshot.fullUrl}
                alt="Screenshot Preview"
                style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }}
              />
            ) : (
              <div style={{ padding: "40px", color: "#94a3b8", textAlign: "center" }}>No image available</div>
            )}
            <div style={{ marginTop: "12px", fontSize: "13px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
              <span>Captured: {formatTime(selectedScreenshot.captured_at)}</span>
              {selectedScreenshot.reason && (
                <span style={{ background: "#3b82f6", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>
                  {selectedScreenshot.reason}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Screenshots;