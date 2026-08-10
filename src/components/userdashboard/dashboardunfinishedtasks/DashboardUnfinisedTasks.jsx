import React, { useEffect, useState } from "react";
import "./DashboardUnfinisedTasks.css";
import { useNavigate } from "react-router-dom";
import { FaRegCommentDots, FaPaperclip } from "react-icons/fa";
import { HiOutlineArrowSmRight } from "react-icons/hi";
import api from "../../../api/api";

const DashboardUnfinisedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin_app/tasks/user/")
      .then(res => {
        const allTasks = res.data.tasks || [];
        // Filter only incomplete tasks for the dashboard
        const unfinished = allTasks.filter(t => t.status !== "Completed");
        setTasks(unfinished.slice(0, 4)); // Show only top 4
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="dashboard-unfinished-card">
      <div className="dashboard-unfinished-header">
        <p>Unfinished Tasks</p>
        <div
          className="dashboard-unfinished-arrow"
          onClick={() => navigate("/task")}
        >
          <HiOutlineArrowSmRight size={18} color="#64748b" />
        </div>
      </div>

      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <div className="dashboard-unfinished-task" key={index} onClick={() => navigate(`/taskdetails/${task.id}`)} style={{ cursor: 'pointer' }}>
            <div className="dashboard-unfinished-title">{task.task_name}</div>
            <div className="dashboard-unfinished-date">
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}
            </div>

            <div className="hr">
              <hr className="hr-dahboard" />
            </div>

            <div className="dashboard-unfinished-footer">
              <span className={`dashboard-priority-pill ${task.priority?.toLowerCase()}`}>
                {task.priority || "Normal"}
              </span>
              <div className="dashboard-task-meta">
                <span>
                  <FaRegCommentDots /> 0
                </span>
                <span>
                  <FaPaperclip /> 0
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '20px', color: '#94a3b8', fontSize: '14px' }}>No unfinished tasks</div>
      )}
    </div>
  );
};

export default DashboardUnfinisedTasks;
