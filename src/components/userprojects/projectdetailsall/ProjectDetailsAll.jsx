import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiEye, FiLock } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import api from "../../../api/api";
import { toast } from "react-toastify";
import "../../employees/Employees.css";
import "./ProjectDetailsAll.css";
import { IoFilter } from "react-icons/io5";
import { FaSort } from "react-icons/fa";

import NewProjectModal from "../newprojects/NewProjectModal";
import EditProjectModal from "../editproject/EditProjectModal";

const ProjectDetailsAll = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Filter & sort modes
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortMode, setSortMode] = useState("None");

  // ── Access control ──────────────────────────────────────────────
  const userRole = localStorage.getItem("user_role") || "";
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  const denyAction = (action) => {
    toast.error(`You do not have permission to ${action}. Only admins can perform this action.`);
  };

  const fetchProjects = () => {
    let url = "admin_app/projects/";

    if (filterStatus !== "All") {
      url += `?status=${encodeURIComponent(filterStatus)}`;
    }

    api.get(url)
      .then((res) => {
        const backendProjects = res.data.projects || res.data || [];

        const mapped = backendProjects.map((p) => ({
          id: p.id,
          work: p.project_name,
          project_name: p.project_name,
          company: p.company_name,
          status: p.status || "Pending",
          dueDate: p.due_date,
          due_date: p.due_date,
          time: p.due_date ? `Due ${p.due_date}` : "No date",
          progress: p.progress || 0,
          priority: p.priority || "Medium",
          team_name: p.team?.team_name || p.team_name || "-",
        }));

        setProjects(mapped);
      })
      .catch((err) => {
        console.error("Failed to load projects", err);
        toast.error("Failed to load projects");
      });
  };

  useEffect(() => {
    fetchProjects();
  }, [filterStatus, sortMode]);

  const handleFilter = () => {
    const order = ["All", "In Progress", "Pending", "To Do", "Completed"];
    const nextFilter = order[(order.indexOf(filterStatus) + 1) % order.length];
    setFilterStatus(nextFilter);
  };

  const handleSort = () => {
    const order = ["None", "Due Date", "Name", "Progress"];
    setSortMode(order[(order.indexOf(sortMode) + 1) % order.length]);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      denyAction("delete this project");
      return;
    }
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`admin_app/projects/${id}/delete/`);
      toast.success(res.data?.message || "Project deleted successfully");
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.response?.data?.message || "Unable to delete project");
    }
  };

  const handleOpenEdit = (proj) => {
    if (!isAdmin) {
      denyAction("edit this project");
      return;
    }
    setSelectedProject(proj);
    setIsEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    if (!isAdmin) {
      denyAction("add a project");
      return;
    }
    setIsModalOpen(true);
  };

  // Sorted array
  const displayedProjects = [...projects];

  if (sortMode === "Name") {
    displayedProjects.sort((a, b) =>
      (a.work || "").localeCompare(b.work || "")
    );
  } else if (sortMode === "Due Date") {
    displayedProjects.sort(
      (a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
    );
  } else if (sortMode === "Progress") {
    displayedProjects.sort(
      (a, b) => (b.progress || 0) - (a.progress || 0)
    );
  }

  return (
    <div className="users-table-container" style={{ padding: '32px' }}>
      {/* Header */}
      <div className="users-table-header">
        <h2>Projects</h2>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="proj-sort-filt-btn" onClick={handleFilter}>
            {/* <img src="#" alt="filter" /> */}
            <IoFilter />
            <span className="filt-sort">Filter: {filterStatus}</span>
          </button>

          <button className="proj-sort-filt-btn" onClick={handleSort}>
            {/* <img src="#" alt="sort" /> */}
            <FaSort />
            <span className="filt-sort">Sort: {sortMode}</span>
          </button>

          {/* Add Project — admin only */}
          {isAdmin ? (
            <button className="add-user-btn" onClick={handleOpenAdd}>
              + Add Project
            </button>
          ) : (
            <span
              title="Only admins can add projects"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "#94a3b8",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "7px 14px",
                cursor: "not-allowed",
              }}
            >
              <FiLock size={13} /> Add Project
            </span>
          )}
        </div>
      </div>

      {/* Modals — only mount when admin */}
      {isAdmin && (
        <>
          <NewProjectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchProjects}
          />
          <EditProjectModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            project={selectedProject}
            onSuccess={fetchProjects}
          />
        </>
      )}

      {/* Table */}
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Team</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Progress</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {displayedProjects.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  No Projects Found
                </td>
              </tr>
            ) : (
              displayedProjects.map((proj) => (
                <tr key={proj.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {proj.work}
                    </div>
                  </td>

                  <td>{proj.team_name}</td>

                  <td>
                    <span className="project-Status" style={{ display: 'inline-block' }}>
                      {proj.status}
                    </span>
                  </td>

                  <td>{proj.dueDate ? proj.dueDate.slice(0, 10) : "-"}</td>

                  <td>{proj.priority}</td>

                  <td>
                    <div className="progress-bar-per">
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                      <span className="progress-value">{proj.progress}%</span>
                    </div>
                  </td>

                  <td className="action-cell">
                    {/* View — always visible */}
                    <NavLink
                      to={`/user/projectdetails/${proj.id}`}
                      className="icon-btn"
                      title="View Details"
                      style={{ background: '#f1f5f9', color: '#475569' }}
                    >
                      <FiEye />
                    </NavLink>

                    {/* Edit — admin only */}
                    {isAdmin ? (
                      <button
                        className="icon-btn edit-btn"
                        title="Edit Project"
                        onClick={() => handleOpenEdit(proj)}
                      >
                        <FiEdit2 />
                      </button>
                    ) : (
                      <button
                        className="icon-btn"
                        title="Only admins can edit projects"
                        style={{ color: '#cbd5e1', cursor: 'not-allowed', background: '#f8fafc' }}
                        onClick={() => denyAction("edit this project")}
                      >
                        <FiLock size={14} />
                      </button>
                    )}

                    {/* Delete — admin only */}
                    {isAdmin ? (
                      <button
                        className="icon-btn delete-btn"
                        title="Delete Project"
                        onClick={() => handleDelete(proj.id)}
                      >
                        <FiTrash2 />
                      </button>
                    ) : (
                      <button
                        className="icon-btn"
                        title="Only admins can delete projects"
                        style={{ color: '#cbd5e1', cursor: 'not-allowed', background: '#f8fafc' }}
                        onClick={() => denyAction("delete this project")}
                      >
                        <FiLock size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectDetailsAll;
