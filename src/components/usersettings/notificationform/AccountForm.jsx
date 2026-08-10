import React, { useEffect, useState } from "react";
import api from "../../../api/api"; // Import your axios instance
import "./AccountForm.css";

const AccountForm = () => {
  const [user, setUser] = useState({
    name: "",
    mobile: "",
    email: ""
  });

  useEffect(() => {
    // Fetch fresh data from the backend using the token in localStorage
    api.get("/admin_app/current_user/") 
      .then((res) => {
        setUser({
          name: res.data.name || "",
          mobile: res.data.mobile || "",
          email: res.data.email || ""
        });
      })
      .catch((err) => {
        console.error("Could not fetch user profile", err);
      });
  }, []);

  return (
    <div className="account-page">
      <div className="account-card">

        {/* Profile Picture */}
        <div className="profile-section">
          <label className="form-label">Profile picture</label>
          <div className="profile-actions">
            <button className="btn-primary">Upload image</button>
            <button className="btn-outline">Remove</button>
          </div>
        </div>

        {/* Name */}
        <div className="form-group full-width">
          <label className="form-label">Name</label>
          <input
            type="text"
            value={user.name}
            readOnly
          />
        </div>

        {/* Mobile */}
        <div className="form-group full-width">
          <label className="form-label">Mobile Number</label>
          <input
            type="text"
            value={user.mobile}
            readOnly
          />
        </div>

        {/* Email as Username */}
        <div className="form-group full-width">
          <label className="form-label">Username</label>
          <input
            type="text"
            value={user.email}
            readOnly
          />
          <small className="helper-text">
            You can change your username once every 30 days
          </small>
        </div>

        <div className="form-actions">
          <button className="btn-outline">Cancel</button>
          <button className="btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
};

export default AccountForm;