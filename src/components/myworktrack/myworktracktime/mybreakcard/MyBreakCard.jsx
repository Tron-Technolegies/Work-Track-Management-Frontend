import React from "react";
import "./MyBreakCard.css";
import { FaPersonWalking } from "react-icons/fa6";

function MyBreakCard({ isOnBreak, onToggleBreak, clockedIn }) {
  return (
    <div
      className={`work-card ${isOnBreak ? "on-break" : ""}`}
      onClick={clockedIn ? onToggleBreak : undefined}
      style={{
        cursor: clockedIn ? "pointer" : "not-allowed",
        opacity: clockedIn ? 1 : 0.6
      }}
      title={clockedIn ? "" : "Clock in first to take a break"}
    >
      <div className="play-button" style={{ background: isOnBreak ? "#ef4444" : "#f59e0b" }}>
        <FaPersonWalking className="break-icon" />
      </div>

      <p>{isOnBreak ? "End Break" : "Break"}</p>
    </div>
  );
}

export default MyBreakCard;