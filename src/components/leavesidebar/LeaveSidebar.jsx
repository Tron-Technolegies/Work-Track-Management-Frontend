import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaClipboardList,
  FaRegFileAlt,
  FaWallet,
  FaCheckCircle,
  FaSlidersH,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./LeaveSidebar.css";
import api from "../../api/api";

function LeaveSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [stats, setStats] = useState({ pending: 0, approved: 0, denied: 0 });

  const userRole = (localStorage.getItem("user_role") || "user").toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "super_admin";
  const isLead = userRole === "project_lead";

  const canViewApprovals = isAdmin || isLead;
  const canManageLeaveTypes = isAdmin;

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

  // Fetch leave request stats (company-scoped via backend)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("user_app/my-leave-requests/");
        const data = res.data || [];
        setStats({
          pending: data.filter((r) => (r.status || "").toLowerCase() === "pending").length,
          approved: data.filter((r) => (r.status || "").toLowerCase() === "approved").length,
          denied: data.filter((r) => {
            const s = (r.status || "").toLowerCase();
            return s === "rejected" || s === "denied";
          }).length,
        });
      } catch (err) {
        console.error("Failed to fetch leave stats:", err);
      }
    };

    fetchStats();

    // Refresh stats when a leave is submitted
    const handleSubmitted = () => fetchStats();
    window.addEventListener("leave-submitted", handleSubmitted);
    return () => window.removeEventListener("leave-submitted", handleSubmitted);
  }, []);

  const links = [
    {
      to: "/user/leave/apply_leave",
      Icon: FaClipboardList,
      label: "Apply Leave",
      show: true,
    },
    {
      to: "/user/leave/leave_application",
      Icon: FaRegFileAlt,
      label: "My Applications",
      show: true,
    },
    {
      to: "/user/leave/leave_balance",
      Icon: FaWallet,
      label: "Leave Balance",
      show: true,
    },
    {
      to: "/user/leave/leave_approval",
      Icon: FaCheckCircle,
      label: "Leave Approvals",
      badge: "Manage",
      show: canViewApprovals,
    },
    {
      to: "/user/leave/leave_types",
      Icon: FaSlidersH,
      label: "Leave Types",
      badge: "Admin",
      show: canManageLeaveTypes,
    },
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
        <span>Leave Menu</span>
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
          {links
            .filter((link) => link.show)
            .map(({ to, Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive ? "leave-link active" : "leave-link"
                }
              >
                <Icon />
                <span className="link-label">{label}</span>
                {badge && <span className="leave-link-badge">{badge}</span>}
              </NavLink>
            ))}
        </div>

        <div className="leave-stats">
          <h5>Quick Stats</h5>
          <div className="stat-row">
            <span>Pending</span>
            <span className="pending">{stats.pending}</span>
          </div>
          <div className="stat-row">
            <span>Approved</span>
            <span className="approved">{stats.approved}</span>
          </div>
          <div className="stat-row">
            <span>Denied</span>
            <span className="denied">{stats.denied}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default LeaveSidebar;
