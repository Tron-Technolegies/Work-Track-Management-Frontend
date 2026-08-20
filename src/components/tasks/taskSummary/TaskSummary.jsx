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
import ConfirmationModal from "../../confirmationmodal/ConfirmationModal";

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
  const [deleteTask, setDeleteTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

    const handleTaskRefresh = () => {
      fetchTasks(selectedDate);
    };

    window.addEventListener("task-created", handleTaskRefresh);
    window.addEventListener("task-updated", handleTaskRefresh);
    window.addEventListener("task-status-updated", handleTaskRefresh);
    window.addEventListener("task-deleted", handleTaskRefresh);

    return () => {
      window.removeEventListener("task-created", handleTaskRefresh);
      window.removeEventListener("task-updated", handleTaskRefresh);
      window.removeEventListener("task-status-updated", handleTaskRefresh);
      window.removeEventListener("task-deleted", handleTaskRefresh);
    };
  }, [selectedDate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

    const handleDeleteTask = async () => {
        if (!deleteTask) return;

        try {
            setDeleting(true);

            await api.delete(
                `admin_app/tasks/${deleteTask.id}/delete/`
            );

            setTasks((prevTasks) =>
                prevTasks.filter(
                    (task) => task.id !== deleteTask.id
                )
            );

            toast.success("Task deleted successfully");

            window.dispatchEvent(new Event("task-deleted"));
            window.dispatchEvent(new Event("task-status-updated"));

            setDeleteTask(null);

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.error ||
                "Failed to delete task"
            );

        } finally {
            setDeleting(false);
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

  const CustomDateInput = React.forwardRef(({ onClick }, ref) => (
    <button
      type="button"
      className="task-calendar-filter-btn"
      onClick={onClick}
      ref={ref}
      title="Filter tasks by date"
    >
      <span className="task-selected-day">
        {formatDisplayDate(selectedDate)}
      </span>
      <SlCalender className="task-calendar-icon" />
    </button>
  ));

  return (
    <div className="task-summary-section">
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={selectedTask}
        onSuccess={() => fetchTasks(selectedDate)}
      />
      <ConfirmationModal
        isOpen={!!deleteTask}
        title="Delete Task"
        message={
          deleteTask
            ? `Are you sure you want to delete "${deleteTask.task_name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTask(null)}
        loading={deleting}
      />

      <div className="task-summary-header">
        <h2>Task Summary</h2>

        <div className="task-top-bar-actions">
          <div className="task-current-day-badge">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              customInput={<CustomDateInput />}
              popperPlacement="bottom-end"
              popperClassName="task-datepicker-popper"
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [0, 8],
                  },
                },
              ]}
            />

            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                title="Clear date filter"
                className="task-clear-date-btn"
              >
                <FiX size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="task-table-wrapper">
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
                          onClick={() => setDeleteTask(task)}
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
