import React from "react";
import "./MyProgressChart.css";

function MyProgressChart({ elapsedSeconds = 0, breakSeconds = 0, targetSeconds = 28800 }) {
  const percent = Math.min(Math.round((elapsedSeconds / targetSeconds) * 100), 100);
  const degrees = Math.round((percent / 100) * 360);

  const focusH = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
  const focusM = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0");
  const focusS = String(elapsedSeconds % 60).padStart(2, "0");

  const breakH = String(Math.floor(breakSeconds / 3600)).padStart(2, "0");
  const breakM = String(Math.floor((breakSeconds % 3600) / 60)).padStart(2, "0");

  const ringStyle = {
    background: `conic-gradient(#7c3aed ${degrees}deg, #e2e8f0 ${degrees}deg 360deg)`,
    transition: "background 0.5s ease",
  };

  return (
    <div className="progress-card">
      <div className="progress-ring" style={ringStyle}>
        <div className="progress-center">
          <h2>{percent}%</h2>
          <p>Working</p>
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      <div style={{ width: "100%", marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
          <span>Progress</span>
          <span>{focusH}h {focusM}m / 08h 00m</span>
        </div>
        <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)",
              borderRadius: "4px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      <div className="progress-details">
        <div className="detail-item">
          <span className="title">Break</span>
          <span className="value break">{breakH}h {breakM}m</span>
        </div>

        <div className="detail-item">
          <span className="title">Working</span>
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