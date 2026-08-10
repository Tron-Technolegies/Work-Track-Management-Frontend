import React from "react";
import "./AllReportsCards.css";

const AllReportsCards = ({ summary }) => {
  const total_working_hours = summary?.total_working_hours || "00h 00m";
  const clock_in = summary?.clock_in || "--:--";
  const clock_out = summary?.clock_out || "--:--";
  const break_duration = summary?.break_duration || "0 min";
  const task_time = summary?.task_time || "0 min";

  return (
    <div className="all-reports-cards-container">
      <div className="all-rep-card">
        <span className="all-rep-card-title">Total Working Hours</span>
        <span className="all-rep-card-value text-green">{total_working_hours}</span>
      </div>

      <div className="all-rep-card">
        <span className="all-rep-card-title">Clock In</span>
        <span className="all-rep-card-value text-blue">{clock_in}</span>
      </div>

      <div className="all-rep-card">
        <span className="all-rep-card-title">Clock Out</span>
        <span className="all-rep-card-value text-red">{clock_out}</span>
      </div>

      <div className="all-rep-card">
        <span className="all-rep-card-title">Break Duration</span>
        <span className="all-rep-card-value text-orange">{break_duration}</span>
      </div>

      <div className="all-rep-card">
        <span className="all-rep-card-title">Task Time</span>
        <span className="all-rep-card-value text-purple">{task_time}</span>
      </div>
    </div>
  );
};

export default AllReportsCards;
