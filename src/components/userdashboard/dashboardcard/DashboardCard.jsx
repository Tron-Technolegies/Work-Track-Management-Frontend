import React, { useEffect, useState } from "react";
import "./DashboardCard.css";
import api from "../../../api/api"; // Assuming your axios instance is here

const DashboardCard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    unfinished: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch Projects and Tasks in parallel
        const [projRes, taskRes] = await Promise.all([
          api.get("/admin_app/projects/total-by-user/"),
          api.get("/admin_app/tasks/summary/")
        ]);

        setStats({
          projects: projRes.data.total_projects || 0,
          tasks: taskRes.data.total_tasks || 0,
          completed: taskRes.data.completed_tasks || 0,
          unfinished: taskRes.data.unfinished_tasks || 0,
        });
      } catch (err) {
        console.error("Dashboard API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    { title: "Number of Projects", icon: "no of project user.svg", count: stats.projects, class: "blue" },
    { title: "Number of Tasks", icon: "no of tasks user.svg", count: stats.tasks, class: "purple" },
    { title: "Unfinished Tasks", icon: "un finished user icon.svg", count: stats.unfinished, class: "orange" },
    { title: "Completed Tasks", icon: "completed task user.svg", count: stats.completed, class: "green" },
  ];

  if (loading) return <div className="loading-text">Updating Dashboard...</div>;

  return (
    <div className="card-space">
      {cards.map((card, index) => (
        <div className={`dashboard-card-div ${card.class}`} key={index}>
          <div className="dashboard-card-name">{card.title}</div>
          <div className="dashboard-card-icon-count">
            <div className="dashboard-card-icon">
              <img src={card.icon} alt={card.title} />
            </div>
            <div className="dashboard-card-count">{card.count}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCard;