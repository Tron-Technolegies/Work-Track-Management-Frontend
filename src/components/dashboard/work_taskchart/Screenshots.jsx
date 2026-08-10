import React, { useEffect, useState } from "react";
import "./Screenshots.css";
import { FiImage } from "react-icons/fi";
import api from "../../../api/api";

function Screenshots() {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!capturedAt) return "9:54 AM";
    try {
      return new Date(capturedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "9:54 AM";
    }
  };

  return (
    <div className="screenshots-container">
      <h3 className="screenshots-title">Suspicious Screenshots</h3>

      {loading ? (
        <p style={{ padding: "20px", color: "#94a3b8" }}>Loading screenshots...</p>
      ) : screenshots.length === 0 ? (
        <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
          <FiImage size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
          <p>No suspicious screenshots recorded</p>
        </div>
      ) : (
        <div className="screenshots-grid">
          {screenshots.map((item) => (
            <div className="screenshot-card" key={item.id}>
              <div className="screenshot-image">
                {item.image ? (
                  <img src={item.image} alt={item.employee_name || item.name || "Screenshot"} />
                ) : (
                  <div className="placeholder">
                    <FiImage className="placeholder-icon" />
                  </div>
                )}
              </div>

              <div className="screenshot-info">
                <h4>{item.employee_name || item.name || item.email || "Employee"}</h4>
                <p>{formatTime(item.captured_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Screenshots;