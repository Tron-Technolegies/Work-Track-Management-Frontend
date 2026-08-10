import React from "react";
import { NavLink } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./EmployeeProductivity.css";

const Employeeproductivity = ({ user }) => {
  if (!user) {
    return (
      <div className="employee-status-container">
        <h2>Loading employee details...</h2>
      </div>
    );
  }

  const idleText = typeof user.idle_today === "number"
    ? `${user.idle_today}m`
    : user.idle_today || "0m";

  const cards = [
    {
      label: "Active Tasks",
      val: user.active_projects ?? 0,
      color: "#8B5CF6",
    },
    {
      label: "Tasks In Progress",
      val: user.in_progress ?? 0,
      color: "#06B6D4",
    },
    {
      label: "Completed Tasks",
      val: user.completed ?? 0,
      color: "#22C55E",
    },
    {
      label: "Idle Time Today",
      val: idleText,
      color: "#F97316",
    },
  ];

  return (
    <div className="employee-status-container">
      <div className="employee-name-title">
        <div className="arrow" title="Back to Productivity">
          <NavLink to="/user/productivity" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiArrowLeft size={22} color="#7c3aed" />
          </NavLink>
        </div>

        <div className="employee-name">
          <img
            src={user.profile_picture || "/employee pic.svg"}
            alt={user.name || "Employee"}
            className="employee-avatar-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/employee pic.svg";
            }}
          />
          <div>
            <div className="name">{user.name || "Employee"}</div>
            <div className="designation">{user.email || ""}</div>
          </div>
        </div>
      </div>

      <hr className="employee-divider" />

      <div className="employee-status-space">
        {cards.map((card, index) => (
          <div
            key={index}
            className="employee-status-card"
            style={{
              borderLeft: `5px solid ${card.color}`,
            }}
          >
            <div className="stats_name">{card.label}</div>
            <div className="numbers">{card.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employeeproductivity;