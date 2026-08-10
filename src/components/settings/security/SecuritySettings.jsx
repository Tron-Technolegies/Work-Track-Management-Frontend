import React, { useEffect, useState } from "react";
import "./SecuritySettings.css";
import api from "../../../api/api.jsx";
import { toast } from "react-toastify";
import {
    FiLock,
    FiShield,
    FiSave
} from "react-icons/fi";

function SecuritySettings() {

    const [loading,setLoading]=useState(false);

    const [settings,setSettings]=useState({

        min_password_length:8,

        require_uppercase:true,

        require_number:true,

        require_special_character:true,

        force_password_change_days:90,

        session_timeout:30,

        max_login_attempts:5,

        account_lock_minutes:15,

        enable_2fa:false

    });

    useEffect(()=>{

        loadSettings();

    },[]);

    const loadSettings=async()=>{

        try{

            const res=await api.get("/admin_app/security-settings/");

            setSettings(res.data);

        }

        catch{

            toast.error("Unable to load security settings.");

        }

    }

    const handleChange=(e)=>{

        const {name,value,type,checked}=e.target;

        setSettings(prev=>({

            ...prev,

            [name]:
                type==="checkbox"
                ? checked
                : value

        }));

    }

    const saveSettings=async()=>{

        try{

            setLoading(true);

            await api.put(

                "/admin_app/security-settings/",

                settings

            );

            toast.success("Security settings updated.");

        }

        catch{

            toast.error("Unable to save settings.");

        }

        finally{

            setLoading(false);

        }

    }

    return(

        <div className="security-page">

            <div className="security-card">

                <div className="security-header">

                    <div>

                        <h2>Security Settings</h2>

                        <p>
                            Configure authentication and password policies.
                        </p>

                    </div>

                    <FiShield className="security-icon"/>

                </div>

                <div className="security-grid">

                    <div className="security-input">
                        <label>Minimum Password Length</label>
                        <input
                            type="number"
                            name="min_password_length"
                            value={settings.min_password_length}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="security-input">
                        <label>Session Timeout (Minutes)</label>
                        <input
                            type="number"
                            name="session_timeout"
                            value={settings.session_timeout}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="security-input">
                        <label>Maximum Login Attempts</label>
                        <input
                            type="number"
                            name="max_login_attempts"
                            value={settings.max_login_attempts}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="security-input">
                        <label>Account Lock Duration (Minutes)</label>
                        <input
                            type="number"
                            name="account_lock_minutes"
                            value={settings.account_lock_minutes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="security-input">
                        <label>Force Password Change Every (Days)</label>
                        <input
                            type="number"
                            name="force_password_change_days"
                            value={settings.force_password_change_days}
                            onChange={handleChange}
                        />
                    </div>

                </div>

                <div className="security-switches">

                    <label>
                        <input
                            type="checkbox"
                            name="require_uppercase"
                            checked={settings.require_uppercase}
                            onChange={handleChange}
                        />

                        Require Uppercase Letter
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            name="require_number"
                            checked={settings.require_number}
                            onChange={handleChange}
                        />

                        Require Number
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            name="require_special_character"
                            checked={settings.require_special_character}
                            onChange={handleChange}
                        />

                        Require Special Character
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            name="enable_2fa"
                            checked={settings.enable_2fa}
                            onChange={handleChange}
                        />

                        Enable Two-Factor Authentication
                    </label>

                </div>

                <div className="security-footer">

                    <button
                        onClick={saveSettings}
                        disabled={loading}
                        className="security-btn"
                    >

                        <FiSave/>

                        {loading ? "Saving..." : "Save Settings"}

                    </button>

                </div>

            </div>

        </div>

    )

}

export default SecuritySettings;