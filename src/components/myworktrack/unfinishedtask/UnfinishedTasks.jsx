import React, { useEffect, useState } from "react";
import "./UnfinishedTasks.css";
import {
  FiArrowRightCircle,
  FiMessageCircle,
  FiPaperclip,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";

function UnfinishedTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchUnfinishedTasks();
  }, []);

  const fetchUnfinishedTasks = async () => {
    try {
      const res = await api.get("admin_app/tasks/user/");
      const list = res.data.tasks || res.data || [];
      const unfinished = (Array.isArray(list) ? list : []).filter(
        (t) => t.status !== "Completed"
      );
      setTasks(unfinished.slice(0, 4));
    } catch (err) {
      console.error("Error fetching unfinished tasks:", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="unfinished-card">
      <div className="unfinished-header">
        <h2>Unfinished Tasks</h2>

        <button className="unfinished-view-btn" onClick={() => navigate("/user/tasks")}>
          <FiArrowRightCircle />
        </button>
      </div>

      <div className="unfinished-list">
        {tasks.length === 0 ? (
          <p style={{ padding: "20px", color: "#94a3b8", textAlign: "center" }}>
            No unfinished tasks
          </p>
        ) : (
          tasks.map((task) => (
            <div className="unfinished-task-card" key={task.id}>
              <div className="unfinished-top">
                <h3>{task.task_name}</h3>
                <p>Due: {formatDate(task.due_date)}</p>
              </div>

              <div className="unfinished-bottom">
                <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
                  {task.priority || "Medium"}
                </span>

                <div className="task-meta">
                  <div className="meta-item">
                    <FiMessageCircle />
                    <span>0</span>
                  </div>

                  <div className="meta-item">
                    <FiPaperclip />
                    <span>{task.attachments ? 1 : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UnfinishedTasks;