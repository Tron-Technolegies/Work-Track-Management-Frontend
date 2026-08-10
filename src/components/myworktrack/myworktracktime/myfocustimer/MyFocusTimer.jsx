import React from "react";
import "./MyFocusTimer.css";

function MyFocusTimer({ elapsedSeconds = 0 }) {
  const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0");

  return (
    <div className="focus-container">
      <div className="focus-circle">
        {/* Tick Marks */}
        <div className="tick-ring">
          {Array.from({ length: 60 }).map((_, index) => (
            <span
              key={index}
              className={`tick ${index % 15 === 0 ? "major" : ""}`}
              style={{ transform: `rotate(${index * 6}deg)` }}
            />
          ))}
        </div>

        {/* Main Circle */}
        <div className="focus-inner">
          <p className="focus-title">Focus</p>
          <div className="focus-bars">
            <span></span>
            <span></span>
          </div>
          <h2>{hours}h : {minutes}m</h2>
        </div>
      </div>
    </div>
  );
}

export default MyFocusTimer;