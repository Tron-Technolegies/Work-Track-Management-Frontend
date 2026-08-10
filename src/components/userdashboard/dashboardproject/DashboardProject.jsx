import React, { useEffect, useState } from "react";
import "./DashboardProject.css";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import { HiOutlineArrowSmRight } from "react-icons/hi";

const DashboardProject = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/admin_app/projects/")
      .then(res => setProjects(res.data.projects || []))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="dashboard-project-card">
      <div className="dashboard-project-header">
        <p>Active Projects</p>
        <div
          className="dashboard-project-arrow"
          onClick={() => navigate("/project")}
        >
          <HiOutlineArrowSmRight size={18} color="#64748b" />
        </div>
      </div>

      {projects.map((project, index) => (
        <div className="dashboard-project-item" key={index}>
          <div className="dashboard-project-info">
            <div className="dashboard-project-name">{project.Project_Name}</div>
            <div className="dashboard-project-company">
              {project.Company_Name}
            </div>
          </div>

          <div className="dashboard-project-progress">
            <div className="dashboard-progress-bar">
              <div
                className="dashboard-progress-fill"
                style={{ width: "50%" }}   // update when progress comes from DB
              ></div>
            </div>
            <span className="dashboard-progress-text">50%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardProject;
