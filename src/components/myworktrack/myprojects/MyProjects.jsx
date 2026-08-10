import React, { useEffect, useState } from "react";
import "./MyProjects.css";
import { FiArrowRightCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";

function MyProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("admin_app/projects/");
      const list = res.data.projects || res.data || [];
      setProjects(Array.isArray(list) ? list.slice(0, 3) : []);
    } catch (err) {
      console.error("Error fetching my projects:", err);
    }
  };

  return (
    <div className="my-projects">
      <div className="projects-header">
        <h2>Project</h2>

        <button
          className="projects-view-btn"
          onClick={() => navigate("/user/project")}
        >
          <FiArrowRightCircle />
        </button>
      </div>

      <div className="projects-list">
        {projects.length === 0 ? (
          <p style={{ padding: "16px", color: "#94a3b8" }}>No active projects</p>
        ) : (
          projects.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-info">
                <h3>{project.project_name}</h3>
                <p>{project.team?.team_name || project.priority || "Project"}</p>
              </div>

              <div className="project-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>

                <span>{project.progress || 0}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyProjects;