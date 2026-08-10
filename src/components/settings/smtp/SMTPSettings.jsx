import React, { useEffect, useState } from "react";
import api from "../../../api/api.jsx";
import "./SMTPSettings.css";
import { FiMail, FiSave, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";

function SMTPSettings() {
  const [loading, setLoading] = useState(false);

  const [smtp, setSMTP] = useState({
    smtp_host: "",
    smtp_port: "",
    smtp_email: "",
    smtp_password: "",
    smtp_use_tls: true,
    smtp_use_ssl: false,
  });

  useEffect(() => {
    fetchSMTP();
  }, []);

  const fetchSMTP = async () => {
    try {
      const res = await api.get("admin_app/company/smtp-settings/");
      setSMTP({
        ...res.data,
        smtp_password: "",
      });
    } catch (err) {
      console.error("Failed to fetch SMTP settings:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setSMTP((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveSMTP = async () => {
    try {
      setLoading(true);

      await api.put("admin_app/company/smtp-settings/", smtp);

      toast.success("SMTP settings updated successfully.");
    } catch (err) {
      const msg = err.response?.data?.error || "Unable to save SMTP settings.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smtp-page">
      <div className="smtp-card">
        <div className="smtp-header">
          <div>
            <h2>Email (SMTP) Settings</h2>
            <p>Configure your company email server for automated notifications.</p>
          </div>

          <FiMail className="smtp-header-icon" />
        </div>

        <div className="smtp-grid">
          <div className="smtp-group">
            <label>SMTP Host</label>
            <input
              name="smtp_host"
              value={smtp.smtp_host || ""}
              onChange={handleChange}
              placeholder="smtp.gmail.com"
            />
          </div>

          <div className="smtp-group">
            <label>SMTP Port</label>
            <input
              name="smtp_port"
              value={smtp.smtp_port || ""}
              onChange={handleChange}
              placeholder="587"
            />
          </div>

          <div className="smtp-group full">
            <label>Email Address</label>
            <input
              type="email"
              name="smtp_email"
              value={smtp.smtp_email || ""}
              onChange={handleChange}
              placeholder="company@gmail.com"
            />
          </div>

          <div className="smtp-group full">
            <label>Password / App Password</label>
            <input
              type="password"
              name="smtp_password"
              value={smtp.smtp_password || ""}
              onChange={handleChange}
              placeholder="Leave blank to keep existing password"
            />
          </div>

          <div className="smtp-checkboxes">
            <label>
              <input
                type="checkbox"
                name="smtp_use_tls"
                checked={smtp.smtp_use_tls || false}
                onChange={handleChange}
              />
              Use TLS
            </label>

            <label>
              <input
                type="checkbox"
                name="smtp_use_ssl"
                checked={smtp.smtp_use_ssl || false}
                onChange={handleChange}
              />
              Use SSL
            </label>
          </div>
        </div>

        <div className="smtp-actions">
          <button className="secondary-btn" onClick={fetchSMTP}>
            <FiRefreshCw />
            Reset
          </button>

          <button className="primary-btn" onClick={saveSMTP} disabled={loading}>
            <FiSave />
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SMTPSettings;