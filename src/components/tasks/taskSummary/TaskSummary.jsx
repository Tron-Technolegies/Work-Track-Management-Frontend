import React, { useEffect, useState } from "react";
import "./TaskSummary.css";
import "../../employees/Employees.css";
import { useNavigate, NavLink } from "react-router-dom";
import api from "../../../api/api";
import { FiEdit2, FiTrash2, FiEye, FiX, FiLock } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import EditTaskModal from "../editTask/EditTaskModal";
import { SlCalender } from "react-icons/sl";

const TaskSummary = () => {
  const navigate = useNavigate();

  // ── Access control ──────────────────────────────────────────────
  const userRole = localStorage.getItem("user_role") || "";
  const isAdminOrLead =
    userRole === "admin" ||
    userRole === "super_admin" ||
    userRole === "project_lead";
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatTaskDuration = (durationStr) => {
    if (!durationStr) return "0h 0m";
    const parts = durationStr.split(":");
    if (parts.length >= 2) {
      const hrs = parseInt(parts[0], 10);
      const mins = parseInt(parts[1], 10);
      return `${hrs}h ${mins}m`;
    }
    return durationStr;
  };

  const formatLocalDate = (dateObj) => {
    if (!dateObj) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    if (!date) return "All Dates";
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const fetchTasks = async (dateObj = null) => {
    try {
      setLoading(true);
      let url = "admin_app/tasks/";

      if (dateObj) {
        const dateStr = formatLocalDate(dateObj);
        url += `?date=${dateStr}`;
      }

      const response = await api.get(url);
      const fetched = response.data.tasks || response.data || [];
      setTasks(Array.isArray(fetched) ? fetched : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleDeleteTask = async (taskId) => {
    if (!isAdminOrLead) {
      toast.error("You do not have permission to delete tasks. Only admins and project leads can perform this action.");
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`admin_app/tasks/${taskId}/delete/`);
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to delete task");
    }
  };

  const renderAssignedTo = (assigned) => {
    if (!assigned) return "Unassigned";
    if (Array.isArray(assigned)) {
      if (assigned.length === 0) return "Unassigned";
      return assigned
        .map((u) => {
          if (typeof u === "object" && u !== null) {
            return `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username || u.email;
          }
          return String(u);
        })
        .filter(Boolean)
        .join(", ");
    }
    if (typeof assigned === "object") {
      return `${assigned.first_name || ""} ${assigned.last_name || ""}`.trim() || assigned.username || assigned.email;
    }
    return String(assigned);
  };

  return (
    <div className="users-table-container" style={{ padding: "0 32px 32px 32px" }}>
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={selectedTask}
        onSuccess={() => fetchTasks(selectedDate)}
      />

      <div className="users-table-header" style={{ marginBottom: "20px" }}>
        <h2>Task Summary</h2>

        <div className="task-top-bar-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="task-current-day-badge" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="task-selected-day">
              {formatDisplayDate(selectedDate)}
            </span>

            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                title="Clear date filter"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <FiX size={16} />
              </button>
            )}

            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              customInput={
                // <img
                //   src="/Day filter.svg"
                //   alt="calendar"
                //   className="task-calendar-icon"
                //   style={{ cursor: "pointer" }}
                // />
                <SlCalender style={{ cursor: "pointer" }} />
              }
            />
          </div>
        </div>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
               <th>Task Name</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Tracked Time</th>
              <th>Assigned to</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  Loading tasks...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  {selectedDate ? "No tasks found for selected date" : "No tasks found"}
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ fontWeight: 600, color: "#1e293b" }}>
                    {task.task_name}
                  </td>
                  <td>
                    <span className={`prio-badge ${task.priority?.toLowerCase()}`}>
                      {task.priority || "Medium"}
                    </span>
                  </td>
                  <td>{formatDate(task.due_date)}</td>
                  <td>
                    <span className={`status-text ${task.status?.toLowerCase().replace(" ", "-")}`}>
                      {task.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: "600", color: "#8b5cf6" }}>
                      {formatTaskDuration(task.total_time)}
                    </span>
                  </td>
                  <td>
                    {renderAssignedTo(task.assigned_to)}
                  </td>
                  <td className="action-cell">
                    <NavLink
                      to={`/user/taskdetails/${task.id}`}
                      className="icon-btn"
                      title="View Details"
                      style={{ background: "#f1f5f9", color: "#475569" }}
                    >
                      <FiEye />
                    </NavLink>

                    {/* Edit — admin/project_lead only */}
                    {isAdminOrLead ? (
                      <button
                        className="icon-btn edit-btn"
                        title="Edit Task"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <FiEdit2 />
                      </button>
                    ) : (
                      <button
                        className="icon-btn"
                        title="Only admins and project leads can edit tasks"
                        style={{ color: '#cbd5e1', cursor: 'not-allowed', background: '#f8fafc' }}
                        onClick={() => toast.error("You do not have permission to edit tasks.")}
                      >
                        <FiLock size={14} />
                      </button>
                    )}

                    {/* Delete — admin/project_lead only */}
                    {isAdminOrLead ? (
                      <button
                        className="icon-btn delete-btn"
                        title="Delete Task"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <FiTrash2 />
                      </button>
                    ) : (
                      <button
                        className="icon-btn"
                        title="Only admins and project leads can delete tasks"
                        style={{ color: '#cbd5e1', cursor: 'not-allowed', background: '#f8fafc' }}
                        onClick={() => toast.error("You do not have permission to delete tasks.")}
                      >
                        <FiLock size={14} />
                      </button>
                    )}
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

export default TaskSummary;
