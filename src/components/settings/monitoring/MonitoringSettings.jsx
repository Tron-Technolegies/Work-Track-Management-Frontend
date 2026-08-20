import React, { useEffect, useState } from "react";
import "./MonitoringSettings.css";
import api from "../../../api/api.jsx";
import { toast } from "react-toastify";
import {
  FiMonitor, FiSave, FiClock, FiCamera, FiActivity, FiGlobe,
  FiAlertTriangle, FiPlus, FiTrash2, FiShield
} from "react-icons/fi";

function MonitoringSettings() {
  const [loading, setLoading] = useState(false);
  const [newBlockedApp, setNewBlockedApp] = useState("");

  const [settings, setSettings] = useState({
    screenshot_interval: 300,
    screenshot_retention_days: 30,
    idle_timeout: 300,
    screenshot_enabled: true,
    app_tracking_enabled: true,
    website_tracking_enabled: true,
    idle_tracking_enabled: true,
    capture_quality: 90,
    blocked_applications: [],
    screenshot_on_blocked_app: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get("admin_app/admin-monitoring-settings/");
      setSettings({
        ...res.data,
        blocked_applications: res.data.blocked_applications || [],
      });
    } catch (err) {
      console.error("Failed to load monitoring settings:", err);
      toast.error("Failed to load monitoring settings.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addBlockedApp = () => {
    const trimmed = newBlockedApp.trim();
    if (!trimmed) return;
    const existing = (settings.blocked_applications || []).map((a) =>
      a.toLowerCase()
    );
    if (existing.includes(trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" is already in the blocked list.`);
      return;
    }
    setSettings((prev) => ({
      ...prev,
      blocked_applications: [...(prev.blocked_applications || []), trimmed],
    }));
    setNewBlockedApp("");
  };

  const removeBlockedApp = (appName) => {
    setSettings((prev) => ({
      ...prev,
      blocked_applications: (prev.blocked_applications || []).filter(
        (a) => a !== appName
      ),
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      await api.put("admin_app/admin-monitoring-settings/", settings);
      toast.success("Monitoring settings updated successfully.");
    } catch (err) {
      const msg = err.response?.data?.error || "Unable to save settings.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="monitor-page">
      <div className="monitor-card">
        <div className="monitor-header">
          <div>
            <h2>Monitoring Settings</h2>
            <p>Configure how employee monitoring works across your company.</p>
          </div>
          <FiMonitor className="monitor-icon" />
        </div>

        <div className="monitor-grid">
          <div className="monitor-input">
            <label>
              <FiCamera />
              Screenshot Interval (seconds)
            </label>
            <input
              type="number"
              name="screenshot_interval"
              value={settings.screenshot_interval || ""}
              onChange={handleChange}
              min="60"
            />
          </div>

          <div className="monitor-input">
            <label>
              <FiClock />
              Screenshot Retention (days)
            </label>
            <input
              type="number"
              name="screenshot_retention_days"
              value={settings.screenshot_retention_days || ""}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="monitor-input">
            <label>
              <FiActivity />
              Idle Timeout (seconds)
            </label>
            <input
              type="number"
              name="idle_timeout"
              value={settings.idle_timeout || ""}
              onChange={handleChange}
              min="60"
            />
          </div>

          <div className="monitor-input">
            <label>Screenshot Quality (%)</label>
            <input
              type="number"
              name="capture_quality"
              min="10"
              max="100"
              value={settings.capture_quality || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="monitor-options">
          <label>
            <input
              type="checkbox"
              name="screenshot_enabled"
              checked={!!settings.screenshot_enabled}
              onChange={handleChange}
            />
            Enable Screenshot Capture
          </label>

          <label>
            <input
              type="checkbox"
              name="app_tracking_enabled"
              checked={!!settings.app_tracking_enabled}
              onChange={handleChange}
            />
            Enable Application Tracking
          </label>

          <label>
            <input
              type="checkbox"
              name="website_tracking_enabled"
              checked={!!settings.website_tracking_enabled}
              onChange={handleChange}
            />
            <FiGlobe />
            Enable Website Tracking
          </label>

          <label>
            <input
              type="checkbox"
              name="idle_tracking_enabled"
              checked={!!settings.idle_tracking_enabled}
              onChange={handleChange}
            />
            Enable Idle Detection
          </label>

          <label>
            <input
              type="checkbox"
              name="screenshot_on_blocked_app"
              checked={!!settings.screenshot_on_blocked_app}
              onChange={handleChange}
            />
            <FiAlertTriangle style={{ color: "#ef4444" }} />
            Capture Immediate Screenshot on Blocked App
          </label>
        </div>

        {/* ── Blocked Applications Section ── */}
        <div className="blocked-apps-section">
          <div className="blocked-apps-header">
            <div className="blocked-apps-title">
              <FiShield className="blocked-apps-icon" />
              <div>
                <h3>Blocked Applications</h3>
                <p>
                  When an employee opens any app from this list during working
                  hours, a screenshot is captured immediately and flagged.
                </p>
              </div>
            </div>
          </div>

          <div className="blocked-apps-input-row">
            <input
              type="text"
              className="blocked-app-input"
              placeholder="e.g. Spotify, Discord, Netflix, Steam..."
              value={newBlockedApp}
              onChange={(e) => setNewBlockedApp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBlockedApp()}
            />
            <button className="blocked-app-add-btn" onClick={addBlockedApp}>
              <FiPlus />
              Add App
            </button>
          </div>

          {settings.blocked_applications && settings.blocked_applications.length > 0 ? (
            <div className="blocked-apps-list">
              {settings.blocked_applications.map((app) => (
                <div key={app} className="blocked-app-tag">
                  <FiAlertTriangle className="blocked-app-tag-icon" />
                  <span>{app}</span>
                  <button
                    className="blocked-app-remove"
                    onClick={() => removeBlockedApp(app)}
                    title={`Remove ${app}`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="blocked-apps-empty">
              <FiShield className="blocked-apps-empty-icon" />
              <p>No blocked applications configured.</p>
              <span>Add application names above to trigger immediate screenshots.</span>
            </div>
          )}
        </div>

        <div className="monitor-footer">
          <button onClick={saveSettings} disabled={loading} className="monitor-btn">
            <FiSave />
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MonitoringSettings;