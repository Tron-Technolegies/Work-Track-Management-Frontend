import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import "./UserTaskDetails.css";
import "../../employees/Employees.css";
import { toast } from "react-toastify";
import {
  FiPlayCircle,
  FiPauseCircle,
  FiCalendar,
  FiSmile,
  FiPaperclip,
  FiImage,
  FiArrowLeft,
  FiEdit2,
  FiLock,
} from "react-icons/fi";
import EditTaskModal from "../../tasks/editTask/EditTaskModal";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const productivityData = [
  {
    name: "Productive",
    value: 60,
    color: "#D58AF5",
  },
  {
    name: "Neutral",
    value: 25,
    color: "#A23CC8",
  },
  {
    name: "Unproductive",
    value: 15,
    color: "#F3C4FF",
  },
];

function UserTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── Access control ──────────────────────────────────────────────
  const userRole = localStorage.getItem("user_role") || "";
  const userId   = parseInt(localStorage.getItem("user_id"), 10);
  const isAdmin  = userRole === "admin" || userRole === "super_admin";
  const isAdminOrLead = isAdmin || userRole === "project_lead";

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [applications, setApplications] = useState([]);
  const [comment, setComment] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Derived: is the current user assigned to this task?
  // Evaluated after task loads.
  const isAssignedToMe = !isAdmin && Array.isArray(task?.assigned_to)
    ? task.assigned_to.some((u) =>
        typeof u === "object" ? u.id === userId : parseInt(u, 10) === userId
      )
    : false;

  useEffect(() => {
    if (!id) return;
    fetchTaskDetails();
    fetchApplicationUsage();
    checkRunningTask();
  }, [id]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`admin_app/tasks/${id}/view/`);
      setTask(res.data.task || res.data);
    } catch (err) {
      console.error("Error fetching task:", err);
      toast.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationUsage = async () => {
    try {
      const res = await api.get("user_app/my-application-usage/");
      setApplications(res.data || []);
    } catch (err) {
      console.error("Error fetching application usage:", err);
    }
  };

  const checkRunningTask = async () => {
    try {
      const res = await api.get(`admin_app/tasks/${id}/running/`);
      if (res.data?.running) {
        setIsRunning(true);
        setSeconds(res.data.elapsed_seconds || 0);
      } else {
        setIsRunning(false);
        setSeconds(0);
      }
    } catch {
      setIsRunning(false);
      setSeconds(0);
    }
  };

  const handleToggleTimer = async () => {
    try {
      if (isRunning) {
        await api.post(`admin_app/tasks/${id}/stop/`);
        setIsRunning(false);
        setSeconds(0);
        toast.success("Task timer stopped");
      } else {
        await api.post(`admin_app/tasks/${id}/start/`);
        setIsRunning(true);
        setSeconds(0);
        toast.success("Task timer started");
      }
      fetchTaskDetails();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update timer";
      toast.error(msg);
    }
  };

  const formatSeconds = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [hrs, mins, secs]
      .map((v) => String(v).padStart(2, "0"))
      .join(":");
  };

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

  if (loading) return <div className="task-details-page" style={{ padding: '40px' }}><p>Loading task details...</p></div>;
  if (!task) return <div className="task-details-page" style={{ padding: '40px' }}><p>Task not found.</p></div>;

  return (
    <div className="task-details-page">
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onSuccess={fetchTaskDetails}
      />

      {/* TOP ACTION BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gridColumn: '1 / -1' }}>
        <button
          onClick={() => navigate("/user/tasks")}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: '#475569' }}
        >
          <FiArrowLeft size={18} /> Back to Tasks
        </button>

        {/* Edit Task — admin/project_lead only */}
        {isAdminOrLead ? (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="add-user-btn"
            style={{ padding: '8px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiEdit2 size={16} /> Edit Task
          </button>
        ) : (
          <span
            title="Only admins and project leads can edit tasks"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "13px", color: "#94a3b8",
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: "8px", padding: "7px 14px",
              cursor: "not-allowed",
            }}
          >
            <FiLock size={13} /> Edit Task
          </span>
        )}
      </div>

      {/* LEFT SIDE */}
      <div className="task-left">
        {/* Header */}
        <div className="task-header">
          <input
            type="text"
            className="task-title"
            value={task.task_name || ""}
            readOnly
          />

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Timer — only for the assigned employee */}
            {isAssignedToMe ? (
              <>
                {isRunning && (
                  <span className="running-timer-badge" style={{
                    color: "#dc2626",
                    background: "#fef2f2",
                    border: "1px solid #fee2e2",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <span style={{ width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%", display: "inline-block" }}></span>
                    {formatSeconds(seconds)}
                  </span>
                )}
                <button className={`start-btn ${isRunning ? "running" : ""}`} onClick={handleToggleTimer}>
                  {isRunning ? "Stop" : "Start"}
                  {isRunning ? <FiPauseCircle size={18} /> : <FiPlayCircle size={18} />}
                </button>
              </>
            ) : (
              <span title={isAdmin ? "Admins cannot track task time" : "You are not assigned to this task"} style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "#94a3b8",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                padding: "5px 12px",
                cursor: "not-allowed",
                fontWeight: "500",
              }}>
                <FiLock size={13} />
                {isAdmin ? "Admin cannot track time" : "Not assigned"}
              </span>
            )}
          </div>
        </div>

        {/* Project & Team */}
        <div className="task-info" style={{ marginBottom: "16px" }}>
          <div>
            <h3>Project</h3>
            <span>{task.project?.project_name || task.project_name || "N/A"}</span>
          </div>

          <div>
            <h3>Team</h3>
            <span>{task.team?.team_name || task.team_name || "Not Assigned"}</span>
          </div>
        </div>

        {/* Description */}
        <div className="section">
          <h3>Description</h3>
          <div className="description-box">
            {task.description || "No description provided."}
          </div>
        </div>

        {/* Deadline & Details */}
        <div className="task-info">
          <div className="deadline">
            <h3>Deadline</h3>
            <div className="date-box">
              <FiCalendar />
              <span>{task.due_date ? new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No due date"}</span>
            </div>
          </div>

          <div className="priority">
            <h3>Priority:</h3>
            <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
              {task.priority || "Normal"}
            </span>
          </div>
        </div>

        <div className="task-info" style={{ marginTop: "16px" }}>
          <div>
            <h3>Status</h3>
            <span className="priority-badge">{task.status || "Pending"}</span>
          </div>

          <div>
            <h3>Assigned To</h3>
            <span>
              {Array.isArray(task.assigned_to) && task.assigned_to.length > 0
                ? task.assigned_to.map(u => typeof u === "object" ? (u.first_name || u.username) : u).join(", ")
                : "Unassigned"}
            </span>
          </div>

          <div>
            <h3>Worked Hours</h3>
            <span>{task.working_hours || 0}h est</span>
          </div>

          <div>
            <h3>Tracked Time</h3>
            <span style={{ fontWeight: "600", color: "#8b5cf6" }}>
              {formatTaskDuration(task.total_time)}
            </span>
          </div>
        </div>

        {/* Comments */}
        {/* <div className="comments">
          <h3>Comments</h3>
          <div className="comment-box">
            <textarea
              placeholder="Add Comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="comment-footer">
              <button onClick={() => {
                if (comment.trim()) {
                  toast.success("Comment added");
                  setComment("");
                }
              }}>
                Comment
              </button>

              <div className="comment-icons">
                <FiSmile />
                <FiPaperclip />
                <FiImage />
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* RIGHT SIDE */}
      <div className="task-right">
        {/* Productivity */}
        <div className="card">
          <h3>Productivity</h3>

          <div className="chart-section">
            <div className="chart">
              <ResponsiveContainer width={170} height={170}>
                <PieChart>
                  <Pie
                    data={productivityData}
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {productivityData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="legend">
              {productivityData.map((item) => (
                <div className="legend-item" key={item.name}>
                  <span
                    className="legend-dot"
                    style={{ background: item.color }}
                  />
                  <p>
                    {item.name} {item.value}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application Usage */}
        <div className="card">
          <h3>Application Usage</h3>

          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Window / Title</th>
                <th>Duration</th>
              </tr>
            </thead>

            <tbody>
              {applications.length > 0 ? (
                applications.slice(0, 5).map((app, index) => (
                  <tr key={app.id || index}>
                    <td>{app.application_name || app.name || "N/A"}</td>
                    <td>{app.window_title || app.title || "Standard"}</td>
                    <td>{app.duration || app.time || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "16px" }}>
                    No recent application data logged
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserTaskDetails;