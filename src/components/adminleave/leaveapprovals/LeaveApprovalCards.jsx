import React, { useEffect, useState } from "react";
import "./LeaveApprovalsCards.css";
import { FiBriefcase, FiClock, FiShield, FiSlash } from "react-icons/fi";
import api from "../../../api/api";

function LeaveApprovalCards() {
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await api.get("admin_app/leave-requests/");
      const data = res.data || [];
      setCounts({
        total: data.length,
        pending: data.filter((d) => (d.status || "").toLowerCase() === "pending").length,
        approved: data.filter((d) => (d.status || "").toLowerCase() === "approved").length,
        rejected: data.filter((d) => {
          const st = (d.status || "").toLowerCase();
          return st === "rejected" || st === "denied";
        }).length,
      });
    } catch (err) {
      console.error("Error fetching leave request counts:", err);
    }
  };

  const leaveCards = [
    {
      id: 1,
      title: "TOTAL REQUESTS",
      value: counts.total,
      icon: <FiBriefcase />,
      bgColor: "#F2EAFF",
      iconColor: "#7C4DFF",
    },
    {
      id: 2,
      title: "PENDING",
      value: counts.pending,
      icon: <FiClock />,
      bgColor: "#FFF2E6",
      iconColor: "#F57C00",
    },
    {
      id: 3,
      title: "APPROVED",
      value: counts.approved,
      icon: <FiShield />,
      bgColor: "#EAF8EF",
      iconColor: "#2EAD5F",
    },
    {
      id: 4,
      title: "DENIED",
      value: counts.rejected,
      icon: <FiSlash />,
      bgColor: "#FFEDED",
      iconColor: "#F44336",
    },
  ];

  return (
    <div className="approval-cards-container">
      {leaveCards.map((card) => (
        <div className="approval-stat-card" key={card.id}>
          <div
            className="approval-stat-card-icon"
            style={{
              background: card.bgColor,
              color: card.iconColor,
            }}
          >
            {card.icon}
          </div>

          <div className="approval-stat-card-content">
            <span className="approval-stat-card-title">{card.title}</span>
            <h2 className="approval-stat-card-value">{card.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LeaveApprovalCards;