import React from "react";
import LeaveTypesManager from "../components/adminleave/leavetypes/LeaveTypesManager";
import { Link } from "react-router-dom";
import { FiLock, FiArrowLeft } from "react-icons/fi";
import "./LeaveTypesPage.css";

function LeaveTypesPage() {
  const userRole = (localStorage.getItem("user_role") || "user").toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  if (!isAdmin) {
    return (
      <div className="leave-types-denied-container animate-fade-in">
        <div className="denied-card">
          <div className="lock-icon-box">
            <FiLock size={32} />
          </div>
          <h2>Admin Access Required</h2>
          <p>
            The Leave Types Management section is restricted to Administrators only.
            Please contact your company admin if you need to add or update leave configurations.
          </p>
          <Link to="/user/leave/apply_leave" className="back-btn">
            <FiArrowLeft size={16} />
            <span>Go to Apply Leave</span>
          </Link>
        </div>
      </div>
    );
  }

  return <LeaveTypesManager />;
}

export default LeaveTypesPage;
