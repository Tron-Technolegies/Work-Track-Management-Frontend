import React, { useEffect, useState } from "react";
import "./TaskTimeSheet.css";
import { FaDownload } from "react-icons/fa";
import DateRangePicker from "./DateRangePicker";
import api from "../../../api/api";

function TaskTimeSheet() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTimeSheetTasks();
  }, []);

  const fetchTimeSheetTasks = async () => {
    try {
      const res = await api.get("admin_app/tasks/user/");
      const list = res.data.tasks || res.data || [];
      setTasks(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching timesheet tasks:", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return dateStr.slice(0, 10);
  };

  return (
    <div className="timesheet-card">
      {/* Header */}
      <div className="timesheet-header">
        <h2>Task Time Sheet</h2>

        <div className="header-actions">
          <button className="export-btn">
            Export
            <FaDownload />
          </button>

          <DateRangePicker />
        </div>
      </div>

      {/* Table — wrapped for responsive horizontal scroll */}
      <div className="timesheet-table-wrapper">
        <table className="timesheet-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Spent / Est</th>
              <th>Assigned To</th>
            </tr>
          </thead>

          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                  No task timesheet records found
                </td>
              </tr>
            ) : (
              tasks.map((item) => (
                <tr key={item.id}>
                  <td>{item.task_name}</td>
                  <td>{item.project?.project_name || item.project_name || "N/A"}</td>
                  <td>{formatDate(item.due_date)}</td>
                  <td>{item.status || "Pending"}</td>
                  <td>{item.working_hours || 0}h est</td>
                  <td>
                    {Array.isArray(item.assigned_to) && item.assigned_to.length > 0
                      ? item.assigned_to.map(u => typeof u === "object" ? (u.first_name || u.username) : u).join(", ")
                      : "Unassigned"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskTimeSheet;