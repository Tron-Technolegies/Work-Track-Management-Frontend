import React from "react";
import {
  FiUser,
  FiBriefcase,
  FiMail,
  FiMonitor,
  FiCalendar,
  FiShield,
} from "react-icons/fi";
import "./SettingsSidebar.css";

const menus = [
  {
    id: "company",
    title: "Company",
    icon: <FiBriefcase />,
  },
  {
    id: "account",
    title: "Account",
    icon: <FiUser />,
  },
  {
    id: "smtp",
    title: "Email (SMTP)",
    icon: <FiMail />,
  },
  {
    id: "monitoring",
    title: "Monitoring",
    icon: <FiMonitor />,
  },
  {
    id: "leave",
    title: "Leave Policy",
    icon: <FiCalendar />,
  },
  {
    id: "security",
    title: "Security",
    icon: <FiShield />,
  },
];

function SettingsSidebar({ tab, setTab }) {
  return (
    <aside className="settings-sidebar">

      <div className="settings-sidebar-header">
        <h2>Settings</h2>
        <p>Manage your workspace</p>
      </div>

      <div className="settings-menu">

        {menus.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`settings-menu-item ${
              tab === item.id ? "active" : ""
            }`}
          >
            <span className="settings-icon">
              {item.icon}
            </span>

            <span>
              {item.title}
            </span>
          </button>
        ))}

      </div>

    </aside>
  );
}

export default SettingsSidebar;