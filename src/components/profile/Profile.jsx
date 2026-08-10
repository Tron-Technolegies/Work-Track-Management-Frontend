import React, { useEffect, useState } from 'react';
import "./Profile.css";
import api from "../../api/api";
import { toast } from "react-toastify";

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin_app/current_user/");
      setUser(res.data);
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user.id) return;

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("first_name", user.first_name || "");
      formData.append("last_name", user.last_name || "");
      formData.append("phone", user.mobile || "");

      if (newPassword) {
        formData.append("password", newPassword);
      }

      const res = await api.put(`admin_app/update_employee/${user.id}/`, formData);
      toast.success(res.data?.message || "Profile updated successfully");
      setNewPassword("");
      setShowPasswordInput(false);
      fetchProfile();
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
              <img src={user.profile_picture || "/default-avatar.png"} alt="Profile" />
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
                <input type="text" value={user.role || ""} readOnly style={{ backgroundColor: "#f1f5f9" }} />

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