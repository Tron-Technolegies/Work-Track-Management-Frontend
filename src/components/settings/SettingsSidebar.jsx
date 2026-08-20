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

const allMenus = [
  {
    id: "company",
    title: "Company",
    icon: <FiBriefcase />,
    adminOnly: true,
  },
  {
    id: "account",
    title: "Account",
    icon: <FiUser />,
    adminOnly: false,
  },
  {
    id: "smtp",
    title: "Email (SMTP)",
    icon: <FiMail />,
    adminOnly: true,
  },
  {
    id: "monitoring",
    title: "Monitoring",
    icon: <FiMonitor />,
    adminOnly: true,
  },
  {
    id: "leave",
    title: "Leave Policy",
    icon: <FiCalendar />,
    adminOnly: true,
  },
  {
    id: "security",
    title: "Security",
    icon: <FiShield />,
    adminOnly: true,
  },
];

function SettingsSidebar({ tab, setTab }) {
  const userRole = localStorage.getItem("user_role") || "";
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  const visibleMenus = allMenus.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="settings-sidebar">

      <div className="settings-sidebar-header">
        <h2>Settings</h2>
        <p>Manage your workspace</p>
      </div>

      <div className="settings-menu">

        {visibleMenus.map((item) => (
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