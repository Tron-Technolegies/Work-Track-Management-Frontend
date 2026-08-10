import React, { useEffect, useState } from "react";
import "./MyLeaveApplicationCard.css";
import { FiClipboard, FiCheck, FiClock } from "react-icons/fi";
import api from "../../../../api/api";

function MyLeaveApplicationCard() {
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await api.get("user_app/my-leave-requests/");
      const data = res.data || [];
      setCounts({
        total: data.length,
        approved: data.filter((d) => (d.status || "").toLowerCase() === "approved").length,
        pending: data.filter((d) => (d.status || "").toLowerCase() === "pending").length,
      });
    } catch (err) {
      console.error("Error fetching user leave application counts:", err);
    }
  };

  const cards = [
    {
      id: 1,
      title: "TOTAL APPLIED",
      value: counts.total,
      icon: <FiClipboard />,
      color: "purple",
    },
    {
      id: 2,
      title: "APPROVED",
      value: counts.approved,
      icon: <FiCheck />,
      color: "green",
    },
    {
      id: 3,
      title: "PENDING",
      value: counts.pending,
      icon: <FiClock />,
      color: "orange",
    },
  ];

  return (
    <div className="my-leave-wrapper">
      <div className="page-heading">
        <p className="heading-small">LEAVE MANAGEMENT</p>
        <h2>My Applications</h2>
      </div>

      <div className="application-cards">
        {cards.map((card) => (
          <div className="application-card" key={card.id}>
            <div className={`card-icon ${card.color}`}>{card.icon}</div>

            <div className="card-content">
              <span className="card-title">{card.title}</span>
              <h2 className="card-value">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyLeaveApplicationCard;