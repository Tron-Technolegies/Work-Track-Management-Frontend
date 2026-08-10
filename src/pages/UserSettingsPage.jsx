import React from 'react'
import SettingsNavbar from '../components/usersettings/notificationnavbar/SettingsNavbar'
import AccountForm from '../components/usersettings/notificationform/AccountForm'
import "./UserSettingsPage.css";

const UserSettingsPage = () => {
  return (
    <div className="settings-page-container animate-fade-in-long">
      {/* <SettingsNavbar /> */}
      <div className="settings-content-area animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <AccountForm />
      </div>
    </div>
  )
}

export default UserSettingsPage
