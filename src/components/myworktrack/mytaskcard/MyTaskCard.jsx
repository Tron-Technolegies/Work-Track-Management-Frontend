import React, { useEffect, useState } from "react";
import "./MyTaskCard.css";
import api from "../../../api/api";

function TaskCards() {
  const [counts, setCounts] = useState({
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchTaskSummary();
  }, []);

  const fetchTaskSummary = async () => {
    try {
      const res = await api.get("admin_app/tasks/summary/");
      setCounts({
        completed: res.data.completed_tasks || res.data.taskdone_tasks || 0,
        pending: (res.data.pending_tasks || 0) + (res.data.todo_tasks || 0) + (res.data.inprogress_tasks || 0),
      });
    } catch (err) {
      console.error("Error fetching task summary:", err);
    }
  };

  const taskData = [
    {
      id: 1,
      title: "Completed Tasks",
      count: counts.completed,
      color: "#84C400",
    },
    {
      id: 2,
      title: "Pending Tasks",
      count: counts.pending,
      color: "#FF6666",
    },
  ];

  return (
    <div className="task-cards-container">
      {taskData.map((task) => (
        <div className="task-card" key={task.id}>
          <h3>{task.title}</h3>

          <h1 className="task-count" style={{ color: task.color }}>
            {task.count}
          </h1>
        </div>
      ))}
    </div>
  );
}

export default TaskCards;