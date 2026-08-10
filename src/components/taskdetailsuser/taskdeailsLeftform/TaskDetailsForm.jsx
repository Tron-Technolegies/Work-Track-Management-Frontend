import React, { useEffect, useState } from "react";
import "./TaskDetailsForm.css";
import { useParams } from "react-router-dom";
import api from "../../../api/api";
import { FiPaperclip, FiSmile, FiImage, FiCalendar } from "react-icons/fi";

const TaskDetailsForm = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setError(null);
      const res = await api.get(`/admin_app/tasks/${id}/view/`);
      if (res.data.task) {
        setTask(res.data.task);
      } else {
        setTask(res.data);
      }
    } catch (err) {
      console.error("Error loading task details:", err);
      setError(err.message || "Failed to load task");
    }
  };

  if (error) return <div className="error-display">Error: {error}</div>;
  if (!task) return <div className="loading-sidebar">Loading Task {id}...</div>;

  return (
    <div className="task-details-form-new">
      <div className="form-section">
        <input
          type="text"
          className="task-hero-title"
          defaultValue={task.task_name}
        />
      </div>

      <div className="form-section">
        <label className="section-label">Description</label>
        <textarea
          className="task-description-box"
          defaultValue={task.description || "No description provided."}
        />
      </div>

      <div className="deadline-priority-row">
        <div className="deadline-group">
          <label className="section-label">Deadline</label>
          <div className="deadline-input-wrapper">
            <FiCalendar className="cal-icon" />
            <span className="deadline-date-text">
              {task.due_date ? new Date(task.due_date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : "No deadline set"}
            </span>
          </div>
        </div>

        <div className="priority-group">
          <span className="priority-title">Priority:</span>
          <span className={`priority-pill-new ${task.priority?.toLowerCase()}`}>
            {task.priority || "Normal"}
          </span>
        </div>
      </div>

      <div className="comments-section-new">
        <label className="section-label">Comments</label>
        <div className="comment-box-wrapper">
          <textarea
            className="comment-textarea"
            placeholder="Add Comment..."
          />
          <div className="comment-actions-bar">
            <button className="comment-post-btn">Comment</button>
            <div className="comment-tools">
              <FiPaperclip />
              <FiSmile />
              <FiImage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsForm;
