import React, { useState, useEffect, useRef } from "react";
import "./AccountSettings.css";
import api from "../../../api/api.jsx";
import { toast } from "react-toastify";
import { FiCamera, FiSave, FiLock, FiUser } from "react-icons/fi";

function AccountSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    company_name: "",
    employee_id: "",
    role: "",
    team_name: "",
    profile_picture: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin_app/account-settings/");
      const d = res.data;
      setFormData({
        first_name: d.first_name || "",
        last_name: d.last_name || "",
        email: d.email || "",
        mobile: d.mobile || "",
        company_name: d.company_name || "",
        employee_id: d.employee_id || `EMP${String(d.id).padStart(3, "0")}`,
        role: d.role || "",
        team_name: d.team_name || "",
        profile_picture: d.profile_picture || null,
      });
      if (d.profile_picture) setPreviewUrl(d.profile_picture);
    } catch {
      toast.error("Failed to load account settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("first_name", formData.first_name);
      payload.append("last_name", formData.last_name);
      payload.append("mobile", formData.mobile);
      if (selectedFile) payload.append("profile_picture", selectedFile);

      const res = await api.put("admin_app/account-settings/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated successfully!");
      // Refresh data
      if (res.data?.data?.profile_picture) {
        setPreviewUrl(res.data.data.profile_picture);
      }
      setSelectedFile(null);
      const currentUser = await api.get("admin_app/current_user/");
      localStorage.setItem("user", JSON.stringify(currentUser.data));
      localStorage.setItem("user_role", currentUser.data.role || "");
      window.dispatchEvent(new CustomEvent("worktrack:profile-updated", {
        detail: currentUser.data,
      }));
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update profile.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    try {
      setSavingPassword(true);
      const payload = new FormData();
      payload.append("currentPassword", passwordData.currentPassword);
      payload.append("newPassword", passwordData.newPassword);
      payload.append("confirmPassword", passwordData.confirmPassword);

      await api.put("admin_app/account-settings/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to change password.";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-card" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          Loading account settings...
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-card">

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-image" onClick={() => fileInputRef.current?.click()} title="Click to change photo">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" onError={(e) => { e.target.onerror = null; e.target.src = "/user icon.svg"; }} />
            ) : (
              <img src="/user icon.svg" alt="Profile" />
            )}
            <div className="profile-image-overlay">
              <FiCamera size={20} />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoSelect}
          />
          <div className="profile-meta">
            <h3>{formData.first_name} {formData.last_name}</h3>
            <p>{formData.role} · {formData.company_name}</p>
            {selectedFile && (
              <small style={{ color: "#8b5cf6", fontSize: "12px" }}>
                New photo selected — save to apply
              </small>
            )}
          </div>
        </div>

        <div className="form-section">
          {/* Personal Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <FiUser color="#8b5cf6" />
            <h2 style={{ margin: 0 }}>Personal Information</h2>
          </div>

          <form onSubmit={handleSaveInfo}>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} disabled />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input type="text" value={formData.company_name} disabled />
              </div>
              <div className="form-group">
                <label>Employee ID</label>
                <input type="text" value={formData.employee_id} disabled />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={formData.role} disabled />
              </div>
              <div className="form-group">
                <label>Team</label>
                <input type="text" value={formData.team_name || "Not assigned"} disabled />
              </div>
            </div>

            <button className="save-btn" type="submit" disabled={saving}>
              <FiSave style={{ marginRight: "6px" }} />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>

          {/* Password Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "28px 0 16px" }}>
            <FiLock color="#8b5cf6" />
            <h2 style={{ margin: 0 }}>Change Password</h2>
          </div>

          <form onSubmit={handleSavePassword}>
            <div className="form-grid">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Enter current password" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Enter new password" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm new password" />
              </div>
            </div>

            <button className="save-btn" type="submit" disabled={savingPassword}>
              <FiLock style={{ marginRight: "6px" }} />
              {savingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default AccountSettings;
