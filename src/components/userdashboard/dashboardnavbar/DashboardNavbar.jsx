import React, { useState, useEffect } from "react";
import api from "../../../api/api/";

import "./DashboardNavbar.css";
import { IoSearchOutline, IoNotificationsOutline } from "react-icons/io5";

const DashboardNavbar = ({ title = "Dashboard" }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("admin_app/current_user/");
        console.log("FULL RESPONSE:", response.data);
        console.log("PROFILE:", response.data.profile_picture);
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCurrentUser();
  }, []);

  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-title">{title}</div>

      <div className="navbar-right">
        <div className="search-box">
          <IoSearchOutline className="search-icon" />
          <input
            type="text"
            placeholder="Start Searching Here..."
            className="search-input"
          />
        </div>

        <div className="nav-actions">
          <div className="notification-bell">
            <IoNotificationsOutline />
            <span className="notification-dot"></span>
          </div>

        <div className="user-profile">
          <img
            src={
              user?.profile_picture ||
              "https://i.pravatar.cc/150?u=user"
            }
            alt="Profile"
          />
        </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;