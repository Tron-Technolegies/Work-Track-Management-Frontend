import React from "react";
import "./MyTimeInfo.css";

function MyTimeInfo({ clockInTime = "--:--", clockOutTime = "--:--", elapsedSeconds = 0, breakSeconds = 0 }) {
  const focusH = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
  const focusM = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0");

  const breakH = String(Math.floor(breakSeconds / 3600)).padStart(2, "0");
  const breakM = String(Math.floor((breakSeconds % 3600) / 60)).padStart(2, "0");

  return (
    <div className="time-info">
      <div className="time-item">
        <p className="time-label">Clock In</p>
        <h2 className="clock-time">{clockInTime}</h2>
      </div>

      <div className="time-item">
        <p className="time-label">Clock Out</p>
        <h2 className="clock-time">{clockOutTime}</h2>
      </div>

      <div className="time-item">
        <p className="time-label">Focus Time</p>
        <h2 className="focus-time">{focusH}h {focusM}m</h2>
      </div>

      <div className="time-item">
        <p className="time-label">Break Time</p>
        <h2 className="break-time">{breakH}h {breakM}m</h2>
      </div>
    </div>
  );
}

export default MyTimeInfo;