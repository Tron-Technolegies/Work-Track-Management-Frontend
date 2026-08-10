import React from 'react'
import NotificationNavbar from '../components/usernotifications/notificationnavbar/NotificationNavbar'
import Notification from '../components/usernotifications/notificcations/Notification'
import "./UserNotificationPage.css";

const UserNotificationPage = () => {
  return (
    <div className="notifications-page-container animate-fade-in-long">
      {/* <NotificationNavbar /> */}
      <div className="notifications-content-area animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Notification />
      </div>
    </div>
  )
}

export default UserNotificationPage
