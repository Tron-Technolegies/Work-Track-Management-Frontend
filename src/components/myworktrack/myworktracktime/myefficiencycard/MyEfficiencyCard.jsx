import React from "react";
import "./MyEfficiencyCard.css";

function MyEfficiencyCard({ elapsedSeconds = 0 }) {
  const percent = Math.min(Math.round((elapsedSeconds / 28800) * 100), 100);

  return (
    <div className="efficiency-card">
      <p className="efficiency-title">Efficiency</p>
      <h1 className="efficiency-value">{percent}%</h1>
      <p className="efficiency-goal">Goal: 8 hours</p>
    </div>
  );
}

export default MyEfficiencyCard;