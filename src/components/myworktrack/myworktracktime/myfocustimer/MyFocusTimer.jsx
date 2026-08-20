import React from "react";
import "./MyFocusTimer.css";

function MyFocusTimer({ elapsedSeconds = 0, isOnBreak = false, breakSeconds = 0 }) {
  const displaySec = isOnBreak ? breakSeconds : elapsedSeconds;
  const hours = String(Math.floor(displaySec / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((displaySec % 3600) / 60)).padStart(2, "0");

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
          <p
            className="focus-title"
            style={{
              color: isOnBreak ? "#d97706" : "#8b8b8b",
              fontWeight: isOnBreak ? "600" : "normal",
            }}
          >
            {isOnBreak ? "On Break" : "Focus"}
          </p>
          <div className="focus-bars">
            <span style={{ background: isOnBreak ? "#f59e0b" : "#8a3ffc" }}></span>
            <span style={{ background: isOnBreak ? "#f59e0b" : "#8a3ffc" }}></span>
          </div>
          <h2 style={{ color: isOnBreak ? "#d97706" : "#222" }}>
            {hours}h : {minutes}m
          </h2>
        </div>
      </div>
    </div>
  );
}

export default MyFocusTimer;