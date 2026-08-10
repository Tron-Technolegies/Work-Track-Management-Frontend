import React from "react";
import "./AttendanceLeave.css";
import { FiDownload } from "react-icons/fi";

const EmployeeAvatar = ({ row }) => {
  const [imgError, setImgError] = React.useState(false);

  if (row.profile_picture && !imgError) {
    return (
      <img
        src={row.profile_picture}
        alt={row.employee_name}
        className="att-avatar-img"
        onError={() => setImgError(true)}
      />
    );
  }
  return <span className="att-avatar">{row.initials}</span>;
};

const AttendanceLeave = ({
  date,
  attendanceLogs = [],
  onExport,
  onOpenCorrection,
  formatDisplayDate
}) => {
  return (
    <div className="att-leave-container">
      <div className="att-panel-header">
        <h3>Live Attendance — {formatDisplayDate ? formatDisplayDate(date) : date}</h3>
        <button className="att-btn-export" onClick={onExport}>
          <FiDownload size={16} /> Export
        </button>
      </div>

      <div className="att-table-wrapper">
        <table className="att-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Branch</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="att-empty-cell">
                  No attendance records logged for today
                </td>
              </tr>
            ) : (
              attendanceLogs.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="att-employee-cell">
                      <EmployeeAvatar row={row} />
                      <span className="att-emp-name">{row.employee_name}</span>
                    </div>
                  </td>
                  <td className="att-branch-cell">{row.branch}</td>
                  <td>{row.check_in}</td>
                  <td>{row.check_out}</td>
                  <td>
                    <span
                      className={`att-status-badge status-${row.status
                        .toLowerCase()
                        .replace(" ", "")}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="att-action-link"
                      onClick={() => onOpenCorrection && onOpenCorrection(row)}
                    >
                      Correction
                    </button>
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

export default AttendanceLeave;
