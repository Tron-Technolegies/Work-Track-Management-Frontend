import React from "react";
import "./AttendanceCalendar.css";

const AttendanceCalendar = ({
  calendarMonth,
  calendarYear,
  calendarDays = {},
  selectedCalendarDay,
  setSelectedCalendarDay,
  isAdmin,
  selectedEmployeeId,
  setSelectedEmployeeId,
  employeesList = []
}) => {
  const getMonthName = (m, y) => {
    const dateObj = new Date(y, m - 1, 1);
    return dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const renderCalendarGrid = () => {
    const totalDays = new Date(calendarYear, calendarMonth, 0).getDate();
    const firstDayOfWeek = new Date(calendarYear, calendarMonth - 1, 1).getDay();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(<div key={`blank-${i}`} className="cal-cell empty"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const statusType =
        calendarDays[d] ||
        (new Date(calendarYear, calendarMonth - 1, d).getDay() % 6 === 0
          ? "weekend"
          : "present");
      const isSelected = d === selectedCalendarDay;

      let cellClass = "cal-cell";
      if (isSelected) {
        cellClass += " selected";
      } else if (statusType === "present") {
        cellClass += " present";
      } else if (statusType === "late") {
        cellClass += " late";
      } else if (statusType === "on_leave") {
        cellClass += " on-leave";
      } else if (statusType === "absent" || statusType === "weekend") {
        cellClass += " absent";
      }

      cells.push(
        <div
          key={`day-${d}`}
          className={cellClass}
          onClick={() => setSelectedCalendarDay && setSelectedCalendarDay(d)}
        >
          {d}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="att-calendar-tab-container">
      <div className="att-panel-header">
        <h3>Attendance Calendar — {getMonthName(calendarMonth, calendarYear)}</h3>

        {isAdmin && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Employee:</span>
            <select
              className="att-select"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId && setSelectedEmployeeId(e.target.value)}
            >
              <option value="">My Calendar (Default)</option>
              {employeesList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="att-calendar-container">
        <div className="cal-header-row">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="cal-grid">{renderCalendarGrid()}</div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
