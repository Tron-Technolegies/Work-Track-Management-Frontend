import React, { useEffect, useRef, useState } from 'react';
import "./Profile.css";
import api from "../../api/api";
import { toast } from "react-toastify";
import { FiCamera } from "react-icons/fi";

function Profile() {
  const [user, setUser] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    company_name: "",
    role: "",
    profile_picture: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin_app/current_user/");
      setUser(res.data);
      setPreviewUrl(res.data.profile_picture || "");
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user.id) return;

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("first_name", user.first_name || "");
      formData.append("last_name", user.last_name || "");
      formData.append("mobile", user.mobile || "");

      if (selectedFile) {
        formData.append("profile_picture", selectedFile);
      }

      if (newPassword) {
        formData.append("password", newPassword);
      }

      const res = await api.put("admin_app/account-settings/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data?.message || "Profile updated successfully");
      setNewPassword("");
      setShowPasswordInput(false);
      setSelectedFile(null);
      const updatedProfile = await api.get("admin_app/current_user/");
      setUser(updatedProfile.data);
      setPreviewUrl(updatedProfile.data.profile_picture || "");
      localStorage.setItem("user", JSON.stringify(updatedProfile.data));
      localStorage.setItem("user_role", updatedProfile.data.role || "");
      window.dispatchEvent(new CustomEvent("worktrack:profile-updated", {
        detail: updatedProfile.data,
      }));
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className='user-profile-main'><p>Loading profile...</p></div>;

  return (
    <div className='user-profile-main'>
        <div className='profile-header'>
            <div className='user-profile-title'>Personal Details</div>
            <div 
              className='profile-password' 
              onClick={() => setShowPasswordInput(!showPasswordInput)}
              style={{ cursor: "pointer" }}
            >
              {showPasswordInput ? "Hide Password" : "Change Password"}
            </div>
        </div>
        <form onSubmit={handleSave} className='profile-form'>
            <div className='user-profile-img'>
              <button
                type="button"
                className='profile-picture-button'
                onClick={() => fileInputRef.current?.click()}
                aria-label={previewUrl ? "Change profile picture" : "Add profile picture"}
              >
                <img src={previewUrl || "/default-avatar.png"} alt="Profile" />
                <span className='profile-picture-overlay'><FiCamera aria-hidden="true" /></span>
              </button>
              <input
                ref={fileInputRef}
                className='profile-picture-input'
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                className='profile-picture-action'
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? "Change Profile Picture" : "Add Profile Picture"}
              </button>
              {selectedFile && <span className='profile-picture-note'>Save to upload your new picture.</span>}
            </div>
            <div className='user-profile-form'>
                <label>First Name</label>
                <input 
                  type="text" 
                  name="first_name" 
                  value={user.first_name || ""} 
                  onChange={handleChange} 
                />

                <label>Last Name</label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={user.last_name || ""} 
                  onChange={handleChange} 
                />

                <label>Email</label>
                <input type="text" value={user.email || ""} readOnly style={{ backgroundColor: "#f1f5f9" }} />

                <label>Company</label>
                <input type="text" value={user.company_name || ""} readOnly style={{ backgroundColor: "#f1f5f9" }} />

                <label>Role</label>
                <input 
                  type="text" 
                  value={
                    user.role?.toLowerCase() === "project_lead"
                      ? "Project Lead"
                      : user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "super_admin"
                      ? "Admin"
                      : "Employee"
                  } 
                  readOnly 
                  style={{ backgroundColor: "#f1f5f9" }} 
                />

                <label>Phone Number</label>
                <input 
                  type="text" 
                  name="mobile" 
                  value={user.mobile || ""} 
                  onChange={handleChange} 
                />

                {showPasswordInput && (
                  <>
                    <label>New Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter new password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                    />
                  </>
                )}

                <div className='profile-save'>
                    <button type="button" onClick={fetchProfile} disabled={saving}>Cancel</button>
                    <button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </form>
    </div>
  );
}

export default Profile;
