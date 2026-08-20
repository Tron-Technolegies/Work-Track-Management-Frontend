import React, { useState } from "react";


import "./SettingsPage.css";
import SettingsSidebar from "../components/settings/SettingsSidebar";
import CompanySettings from "../components/settings/company/CompanySettings";
import AccountSettings from "../components/settings/account/AccountSettings";
import SMTPSettings from "../components/settings/smtp/SMTPSettings";
import MonitoringSettings from "../components/settings/monitoring/MonitoringSettings";
import LeaveSettings from "../components/settings/leave/LeaveSettings";
import SecuritySettings from "../components/settings/security/SecuritySettings";

function SettingsPage() {
    const userRole = localStorage.getItem("user_role") || "";
    const isAdmin = userRole === "admin" || userRole === "super_admin";

    const [tab, setTab] = useState(isAdmin ? "company" : "account");

    const currentTab = !isAdmin && tab !== "account" ? "account" : tab;

    return (
        <div className="settings-page">
            <SettingsSidebar tab={currentTab} setTab={setTab} />

            <div className="settings-content">
                {isAdmin && currentTab === "company" && <CompanySettings />}
                {currentTab === "account" && <AccountSettings />}
                {isAdmin && currentTab === "smtp" && <SMTPSettings />}
                {isAdmin && currentTab === "monitoring" && <MonitoringSettings />}
                {isAdmin && currentTab === "leave" && <LeaveSettings />}
                {isAdmin && currentTab === "security" && <SecuritySettings />}
            </div>
        </div>
    );
}

export default SettingsPage;