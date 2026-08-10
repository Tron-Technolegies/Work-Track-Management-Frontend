import React from "react";
import "./MyWorkCard.css";
import { FaPlay, FaStop } from "react-icons/fa";

function MyWorkCard({ clockedIn, onToggleClock, loading }) {
  return (
    <div
      className={`work-card ${clockedIn ? "clocked-in" : ""}`}
      onClick={loading ? undefined : onToggleClock}
      style={{ cursor: loading ? "wait" : "pointer" }}
    >
      <div className="play-button" style={{ background: clockedIn ? "#ef4444" : "#8b5cf6" }}>
        {clockedIn ? <FaStop className="play-icon" /> : <FaPlay className="play-icon" />}
      </div>

      <p>{loading ? "Processing..." : clockedIn ? "Clock Out" : "Clock In"}</p>
    </div>
  );
}

export default MyWorkCard;