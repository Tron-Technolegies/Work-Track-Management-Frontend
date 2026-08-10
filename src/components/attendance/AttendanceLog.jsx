import React from "react";
import "./AttendanceLog.css";

const AttendanceLog = ({
  date,
  setDate,
  selectedBranch,
  setSelectedBranch,
  appliedBranch,
  onApplyFilters,
  branches = [],
  attendanceLogs = [],
  formatDisplayDate
}) => {
  return (
    <div className="att-log-container">
      <div className="att-panel-header">
        <h3>Attendance Logs</h3>
      </div>

      {/* Filter Bar */}
      <div className="att-filters-bar">
        <div className="att-filter-group">
          <label>Date</label>
          <input
            type="date"
            className="att-input-date"
            value={date}
            onChange={(e) => setDate && setDate(e.target.value)}
          />
        </div>

        <div className="att-filter-group">
          <label>Branch</label>
          <select
            className="att-select"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch && setSelectedBranch(e.target.value)}
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <button className="att-btn-apply" onClick={onApplyFilters}>
          Apply Filters
        </button>
      </div>

      <div className="att-subheading">
        Showing results for {formatDisplayDate ? formatDisplayDate(date) : date} — {appliedBranch}
      </div>

      <div className="att-table-wrapper">
        <table className="att-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Branch</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="att-empty-cell">
                  No logs match the selected filters
                </td>
              </tr>
            ) : (
              attendanceLogs.map((row) => (
                <tr key={row.id}>
                  <td className="att-emp-name-bold">{row.employee_name}</td>
                  <td className="att-branch-cell">{row.branch}</td>
                  <td>{row.check_in}</td>
                  <td>{row.check_out}</td>
                  <td className="att-duration-cell">{row.duration}</td>
                  <td>
                    <span
                      className={`att-status-badge status-${row.status
                        .toLowerCase()
                        .replace(" ", "")}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceLog;
