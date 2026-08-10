import React from "react";
import "./DashboardStatistics.css";

const DashboardStatistics = () => {
  // values from design
  const completed = 19;
  const inProgress = 30;
  const notStarted = 10;

  const total = completed + inProgress + notStarted;

  // convert to percentages
  const completedPct = (completed / total) * 100;
  const inProgressPct = (inProgress / total) * 100;
  const notStartedPct = (notStarted / total) * 100;

  return (
    <div className="statistics-card">
      <div className="statistics-title">Statistics</div>

      <div className="statistics-content">
        {/* Legend */}
        <div className="statistics-legend">
          <div className="legend-item">
            <span className="dot completed"></span>
            <span>Completed Tasks {completed}</span>
          </div>

          <div className="legend-item">
            <span className="dot progress"></span>
            <span>Tasks in Progress {inProgress}</span>
          </div>

          <div className="legend-item">
            <span className="dot not-started"></span>
            <span>Not Started Tasks {notStarted}</span>
          </div>
        </div>

        {/* Donut Chart */}
        <div
          className="donut-chart"
          style={{
            background: `conic-gradient(
              #c084fc 0% ${completedPct}%,
              #8b5cf6 ${completedPct}% ${completedPct + inProgressPct}%,
              #e9d5ff ${completedPct + inProgressPct}% 100%
            )`,
          }}
        >
          <div className="donut-hole"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStatistics;
