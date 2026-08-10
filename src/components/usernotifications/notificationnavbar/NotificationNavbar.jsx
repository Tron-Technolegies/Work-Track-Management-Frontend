import React from 'react'
import "./NotificationNavbar.css"
import { IoNotificationsOutline } from "react-icons/io5";

const NotificationNavbar = () => {
  return (
    <>
      <nav className="dashboard-navbar">
        <div className="dashboard-title">Notification</div>

        <div className="navbar-right">
          <div className="nav-actions">
            <div className="notification-bell">
              <IoNotificationsOutline />
              <span className="notification-dot"></span>
            </div>
            <div className="user-profile">
              <img src="https://i.pravatar.cc/150?u=user" alt="Profile" />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default NotificationNavbar
