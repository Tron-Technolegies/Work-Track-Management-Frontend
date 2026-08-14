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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const res = await api.get("admin_app/tasks/");

      const list = Array.isArray(res.data?.tasks)
        ? res.data.tasks
        : [];

      // Show only first 3 tasks
      setTasks(list.slice(0, 3));

    } catch (error) {
      console.error(
        "Failed to fetch tasks:",
        error.response?.data || error
      );

      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return "No due date";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityClass = (priority) => {
    return (priority || "Medium")
      .toLowerCase()
      .trim();
  };

  return (
    <div className="my-work-task-card">

      {/* HEADER */}
      <div className="my-work-task-header">

        <h2>Tasks</h2>

        <button
          type="button"
          className="my-work-task-view-btn"
          onClick={() => navigate("/user/tasks")}
          aria-label="View all tasks"
        >
          <FiArrowRightCircle />
        </button>

      </div>

      {/* TASK LIST */}
      <div className="my-work-task-list">

        {loading ? (

          <p className="my-work-task-empty">
            Loading tasks...
          </p>

        ) : tasks.length === 0 ? (

          <p className="my-work-task-empty">
            No tasks assigned
          </p>

        ) : (

          tasks.map((task) => (

            <div
              className="my-work-task-item"
              key={task.id}
            >

              {/* TOP */}
              <div className="my-work-task-top">

                <h3 title={task.task_name}>
                  {task.task_name || "Untitled Task"}
                </h3>

                <p>
                  Due: {formatDate(task.due_date)}
                </p>

              </div>

              {/* BOTTOM */}
              <div className="my-work-task-bottom">

                <span
                  className={`my-work-task-priority ${getPriorityClass(
                    task.priority
                  )}`}
                >
                  {task.priority || "Medium"}
                </span>

                <div className="my-work-task-meta">

                  <div className="my-work-task-meta-item">
                    <FiMessageCircle />
                    <span>
                      {task.comments_count || 0}
                    </span>
                  </div>

                  <div className="my-work-task-meta-item">
                    <FiPaperclip />
                    <span>
                      {task.attachments_count || 0}
                    </span>
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