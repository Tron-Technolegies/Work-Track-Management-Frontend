import React from "react";
import "./AttendanceCard.css";
import { FiCheckCircle, FiXCircle, FiClock, FiCalendar } from "react-icons/fi";

const AttendanceCard = ({ summary }) => {
  const { present = 0, absent = 0, late = 0, on_leave = 0 } = summary || {};

  return (
    <div className="att-summary-cards">
      <div className="att-card card-present">
        <div className="att-icon-box icon-present">
          <FiCheckCircle size={22} />
        </div>
        <div className="att-card-info">
          <span className="att-card-num">{present}</span>
          <span className="att-card-label">Present</span>
        </div>
      </div>

      <div className="att-card card-absent">
        <div className="att-icon-box icon-absent">
          <FiXCircle size={22} />
        </div>
        <div className="att-card-info">
          <span className="att-card-num">{absent}</span>
          <span className="att-card-label">Absent</span>
        </div>
      </div>

      <div className="att-card card-late">
        <div className="att-icon-box icon-late">
          <FiClock size={22} />
        </div>
        <div className="att-card-info">
          <span className="att-card-num">{late}</span>
          <span className="att-card-label">Late</span>
        </div>
      </div>

      <div className="att-card card-onleave">
        <div className="att-icon-box icon-onleave">
          <FiCalendar size={22} />
        </div>
        <div className="att-card-info">
          <span className="att-card-num">{on_leave}</span>
          <span className="att-card-label">On Leave</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
