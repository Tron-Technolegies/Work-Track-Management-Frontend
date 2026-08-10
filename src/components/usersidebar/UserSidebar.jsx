import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./UserSidebar.css";
import { TbLogout } from "react-icons/tb";
import { RiMenuFoldLine, RiMenuUnfoldLine } from "react-icons/ri";
import api from "../../api/api";
import { GiWhiteBook } from "react-icons/gi";

const UserSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close on resize back to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = async () => {
    const refresh = localStorage.getItem("refresh");
    try {
      if (refresh) {
        await api.post("/admin_app/logout/", { refresh }, { skipAuth: false });
      }
    } catch (err) {
      console.warn("Logout API failed, clearing local session");
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    }
  };

  const navItems = [
    { to: "/user/dashboard",     icon: "/Sidebar_icons/mage_dashboard-3-fill.svg",     label: "Dashboard" },
    { to: "/user/myworktrack",   icon: "/Sidebar_icons/My_Work_Track icon.svg",label: "My Work Track" },
    { to: "/user/employees",     icon: "/Sidebar_icons/employees-svgrepo-com.svg", label: "Employees" },
    { to: "/user/attendance",    icon: "/Sidebar_icons/attendance-svgrepo-com.svg",label: "Attendance" },
    { to: "/user/teams",         icon: "/Sidebar_icons/group-team-svgrepo-com.svg",label: "Teams" },
    { to: "/user/project",       icon: "/Sidebar_icons/project.svg",label: "Projects" },
    { to: "/user/tasks",         icon: "/usertaskicon.svg", label: "Tasks" },
    { to: "/user/kanbanBoard",   icon: "/Sidebar_icons/Kanbanboard.svg", label: "Kanban Board" },
    { to: "/user/productivity",  icon: "/Sidebar_icons/Reports.svg",label: "Reports" },
    { to: "/user/leave",         icon: "/Sidebar_icons/leave.svg", label: "Leave" },
    { to: "/user/notification",  icon: "/Sidebar_icons/notification.svg",label: "Notifications" },
  ];

  return (
    <>
      {/* ── Hamburger button (mobile only) ── */}
      <button
        className="sidebar-hamburger"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <RiMenuUnfoldLine size={22} />
      </button>

      {/* ── Dark overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar-container ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Close button inside sidebar (mobile) */}
        <button
          className="sidebar-close-btn"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <RiMenuFoldLine size={20} />
          <span>Close</span>
        </button>

        <div className="sidebar-menu">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `menu-box ${isActive ? "active" : ""}`}
            >
              <img className="menu-icon" src={icon} alt="" />
              <span className="menu-text">{label}</span>
            </NavLink>
          ))}

          <div className="line" />

          <NavLink
            to="/user/settings"
            className={({ isActive }) => `menu-box ${isActive ? "active" : ""}`}
          >
            <img className="menu-icon" src="/user settings.svg" alt="" />
            <span className="menu-text">Settings</span>
          </NavLink>

          {/* Logout */}
          <div
            className="sidebar-logout"
            onClick={logout}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && logout()}
          >
            <div className="menu-box logout">
              <TbLogout className="menu-icon" />
              <span className="menu-text">Log out</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
