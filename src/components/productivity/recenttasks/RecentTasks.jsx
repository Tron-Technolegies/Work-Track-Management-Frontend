import React from "react";
import { useNavigate } from "react-router-dom";
import "./RecentTasks.css";

function RecentTasks({ tasks = [] }) {
  const navigate = useNavigate();

  const getStatusClass = (status = "") => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "status-progress";
      case "completed":
      case "task done":
        return "status-completed";
      case "to do":
      case "pending":
        return "status-todo";
      default:
        return "";
    }
  };

  const displayTasks = Array.isArray(tasks) ? tasks.slice(0, 5) : [];

  return (
    <div className="recent-tasks-card">
      <div className="recent-tasks-header">
        <h2>Recent Tasks</h2>

        <button
          className="recent-details-btn"
          onClick={() => navigate("/user/tasks")}
        >
          Details
        </button>
      </div>

      <div className="recent-divider"></div>

      <div className="recent-task-list">
        {displayTasks.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
            No recent tasks found
          </div>
        ) : (
          displayTasks.map((task, idx) => (
            <div className="recent-task-row" key={task.id || idx}>
              <span className="task-title">
                {task.task_name || task.title || "Task"}
              </span>

              <span className={`task-status ${getStatusClass(task.status || "")}`}>
                {task.status || "Pending"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentTasks;