import React from "react";
import "./LeavePolicy.css";

import {
  FiAlertCircle,
  FiClock,
  FiCheck,
  FiCalendar,
} from "react-icons/fi";

function LeavePolicy() {
  const policies = [
    {
      icon: <FiAlertCircle />,
      text: "Apply at least 3 days in advance for annual leave.",
    },
    {
      icon: <FiClock />,
      text: "Sick leave requires a medical certificate for 2+ days.",
    },
    {
      icon: <FiCheck />,
      text: "Carry-over limit: 5 days per year.",
    },
    {
      icon: <FiCalendar />,
      text: "Public holidays don't count against leave days.",
    },
  ];

  return (
    <div className="leave-policy-card">
      <h3 className="policy-title">Leave Policy</h3>

      <div className="policy-list">
        {policies.map((item, index) => (
          <div className="policy-item" key={index}>
            <div className="policy-icon">{item.icon}</div>

            <div className="policy-text">
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeavePolicy;