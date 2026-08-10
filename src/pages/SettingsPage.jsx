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

    const [tab,setTab] = useState("account");

    return (

        <div className="settings-page">

            <SettingsSidebar tab={tab}
                setTab={setTab}/>

            <div className="settings-content">

                {tab==="company" && <CompanySettings/>}

                {tab==="account" && <AccountSettings/>}

                {tab==="smtp" && <SMTPSettings/>}

                {tab==="monitoring" && <MonitoringSettings/>}

                {tab==="leave" && <LeaveSettings/>}

                {tab==="security" && <SecuritySettings/>}

            </div>

        </div>

    )

}

export default SettingsPage;