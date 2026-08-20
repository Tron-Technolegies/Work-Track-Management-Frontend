import React, { useEffect, useState } from 'react'
import "./MyTasks.css"
import { Link } from 'react-router-dom';
import api from "../../../api/api";
import { FiCheckSquare, FiClock, FiClipboard, FiTrendingUp, FiPlus } from "react-icons/fi";
import NewTaskModal from '../newTask/NewTaskModal';

const MyTasks = () => {
  const [summary, setSummary] = useState({
    todo_tasks: 0,
    inprogress_tasks: 0,
    pending_tasks: 0,
    completed_tasks: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSummary = () => {
    api.get("admin_app/tasks/admin-summary/")
      .then(res => 
        {
          console.log("Summary:", res.data);
          setSummary(res.data);})
      .catch(err => console.error("Error fetching admin task summary:", err));
  };

  // useEffect(() => {
  //   fetchSummary();
  // }, []);

  useEffect(() => {
    fetchSummary(); // Load counts immediately

    const refreshSummary = () => {
      fetchSummary();
    };

    window.addEventListener("task-status-updated", refreshSummary);
    window.addEventListener("task-created", refreshSummary);
    window.addEventListener("task-updated", refreshSummary);
    window.addEventListener("task-deleted", refreshSummary);

    return () => {
      window.removeEventListener("task-status-updated", refreshSummary);
      window.removeEventListener("task-created", refreshSummary);
      window.removeEventListener("task-updated", refreshSummary);
      window.removeEventListener("task-deleted", refreshSummary);
    };
  }, []);

  const tasks = [
    { title: "To Do", count: summary.todo_tasks, icon: <FiClipboard />, color: "#b390cc" },
    { title: "In Progress", count: summary.inprogress_tasks, icon: <FiTrendingUp />, color: "#8b5cf6" },
    { title: "Pending", count: summary.pending_tasks, icon: <FiClock />, color: "#d8b4fe" },
    { title: "Task Done", count: summary.completed_tasks, icon: <FiCheckSquare />, color: "#a855f7" }
  ];

  const userRole = localStorage.getItem("user_role") || "";
  const isAdminOrLead = userRole === "admin" || userRole === "super_admin" || userRole === "project_lead";

  return (
    <div className='container-mytasks'>
      <div className='task-page-header'>
        <div className="header-left">
          <h2>My tasks</h2>
          {isAdminOrLead && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
              className="new-task-pill-btn"
            >
              <span className="plus-circle"><FiPlus /></span> New Task
            </button>
          )}
        </div>
      </div>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchSummary();
          window.dispatchEvent(new Event("task-created"));
        }}
      />

      <div className="task-summary-grid-row">
        {tasks.map((task, index) => (
          <div className="task-stat-card" key={index}>
            <div className="stat-icon-wrapper" style={{ color: task.color, backgroundColor: `${task.color}15` }}>
              {task.icon}
            </div>
            <div className="stat-info">
              <div className="stat-title">{task.title}</div>
              <div className="stat-count">{String(task.count).padStart(2, '0')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTasks;
