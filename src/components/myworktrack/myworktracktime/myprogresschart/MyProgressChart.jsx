import React from "react";
import "./MyProgressChart.css";

function MyProgressChart({ elapsedSeconds = 0, breakSeconds = 0 }) {
  const percent = Math.min(Math.round((elapsedSeconds / 28800) * 100), 100);

  const focusH = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
  const focusM = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0");

  const breakH = String(Math.floor(breakSeconds / 3600)).padStart(2, "0");
  const breakM = String(Math.floor((breakSeconds % 3600) / 60)).padStart(2, "0");

  return (
    <div className="progress-card">
      <div className="progress-ring">
        <div className="progress-center">
          <h2>{percent}%</h2>
          <p>Focused</p>
        </div>
      </div>

      <div className="progress-details">
        <div className="detail-item">
          <span className="title">Break</span>
          <span className="value break">{breakH}h {breakM}m</span>
        </div>

        <div className="detail-item">
          <span className="title">Focus</span>
          <span className="value focus">{focusH}h {focusM}m</span>
        </div>

        <div className="detail-item">
          <span className="title">Target</span>
          <span className="value private">08h 00m</span>
        </div>
      </div>
    </div>
  );
}

export default MyProgressChart;