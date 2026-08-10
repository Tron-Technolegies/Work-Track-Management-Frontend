import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaClipboardList,
  FaRegFileAlt,
  FaWallet,
  FaCheckCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./LeaveSidebar.css";

function LeaveSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const links = [
    { to: "/user/leave/apply_leave",       Icon: FaClipboardList, label: "Apply Leave" },
    { to: "/user/leave/leave_application", Icon: FaRegFileAlt,    label: "My Applications" },
    { to: "/user/leave/leave_balance",     Icon: FaWallet,        label: "Leave Balance" },
    { to: "/user/leave/leave_approval",    Icon: FaCheckCircle,   label: "Admin Approvals" },
  ];

  return (
    <>
      {/* ── Hamburger toggle (mobile only) ── */}
      <button
        className="leave-hamburger"
        onClick={() => setOpen(true)}
        aria-label="Open leave menu"
      >
        <FaBars size={16} />
        <span>Leave</span>
      </button>

      {/* ── Overlay ── */}
      {open && (
        <div className="leave-overlay" onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`leave-sidebar ${open ? "leave-sidebar-open" : ""}`}>

        {/* Close button inside (mobile) */}
        <button
          className="leave-close-btn"
          onClick={() => setOpen(false)}
          aria-label="Close leave menu"
        >
          <FaTimes size={14} />
          <span>Close</span>
        </button>

        <div className="leave-sidebar-header">
          <h4>Leave Center</h4>
          <p>Manage requests &amp; balance</p>
        </div>

        <div className="leave-menu">
          {links.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? "leave-link active" : "leave-link"
              }
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="leave-stats">
          <h5>Quick Stats</h5>
          <div className="stat-row">
            <span>Pending</span>
            <span className="pending">4</span>
          </div>
          <div className="stat-row">
            <span>Approved</span>
            <span className="approved">4</span>
          </div>
          <div className="stat-row">
            <span>Denied</span>
            <span className="denied">2</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default LeaveSidebar;
