import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import api from "../../../api/api";
import "../newprojects/NewProject.css";

function EditProject({ project, onClose, onSuccess }) {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    team: "",
    assigned_to: [],
    due_date: "",
    est_hour: "",
    priority: "Medium",
    status: "Pending",
    links: "",
  });

  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  useEffect(() => {
    if (project) {
      if (project.id) {
        fetchProjectDetails(project.id);
      }
    }
  }, [project]);

  const fetchProjectDetails = async (id) => {
    try {
      const res = await api.get(`admin_app/projects/${id}/view/`);
      const proj = res.data.project || res.data;
      setFormData({
        project_name: proj.project_name || "",
        description: proj.description || "",
        team: proj.team?.id || proj.team || "",
        assigned_to: Array.isArray(proj.assigned_to)
          ? proj.assigned_to.map(u => typeof u === "object" ? u.id : u)
          : [],
        due_date: proj.due_date ? proj.due_date.slice(0, 10) : "",
        est_hour: proj.est_hour || "",
        priority: proj.priority || "Medium",
        status: proj.status || "Pending",
        links: proj.links || "",
      });
    } catch {
      setFormData({
        project_name: project.work || project.project_name || "",
        description: project.description || "",
        team: project.team || "",
        assigned_to: project.assigned_to || [],
        due_date: project.dueDate || project.due_date ? (project.dueDate || project.due_date).slice(0, 10) : "",
        est_hour: project.est_hour || "",
        priority: project.priority || "Medium",
        status: project.status || "Pending",
        links: project.links || "",
      });
    }
  };

  const loadTeams = async () => {
    try {
      const res = await api.get("admin_app/view-teams/");
      setTeams(res.data.data || res.data);
    } catch {
      toast.error("Unable to load teams");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("admin_app/users/list/");
      setUsers(res.data);
    } catch {
      toast.error("Unable to load employees");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttachmentClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    e.target.value = null;
  };

  const handleRemoveAttachment = (i) => {
    setAttachments(prev => prev.filter((_, index) => index !== i));
  };

  const handleLinkIconClick = () => {
    if (formData.links?.trim() && !showLinkInput) {
      const url = formData.links.startsWith("http")
        ? formData.links
        : `https://${formData.links}`;
      window.open(url, "_blank");
      return;
    }
    setShowLinkInput(s => !s);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_name) {
      toast.error("Project name is required");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();

      payload.append("project_name", formData.project_name);
      payload.append("description", formData.description);
      payload.append("team", formData.team);

      formData.assigned_to.forEach(id => {
        payload.append("assigned_to", id);
      });

      payload.append("due_date", formData.due_date);
      payload.append("est_hour", formData.est_hour);
      payload.append("priority", formData.priority);
      payload.append("status", formData.status);
      payload.append("links", formData.links);

      attachments.forEach(file => {
        payload.append("attachments", file);
      });

      const res = await api.post(
        `admin_app/projects/${project.id}/update/`,
        payload
      );

      toast.success(res.data?.message || "Project updated successfully!");
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.error || err.response?.data?.message || "Unable to update project"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-card">
      <div className="employee-header">
        <h2>Edit Project</h2>
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <label>Project Name</label>
        <input
          type="text"
          name="project_name"
          placeholder="Enter project name..."
          value={formData.project_name}
          onChange={handleChange}
        />

        <div className="employee-grid">
          <div>
            <label>Team</label>
            <select
              name="team"
              value={formData.team}
              onChange={handleChange}
            >
              <option value="">Select Team</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Priority Level</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        <label>Assign Employees</label>
        <select
          multiple
          value={formData.assigned_to}
          onChange={(e) => {
            const values = Array.from(
              e.target.selectedOptions,
              option => option.value
            );
            setFormData(prev => ({ ...prev, assigned_to: values }));
          }}
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name} - {user.role}
            </option>
          ))}
        </select>

        <div className="employee-grid">
          <div>
            <label>Deadline</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Est. Investment (Hours)</label>
            <input
              type="number"
              name="est_hour"
              placeholder="e.g. 24"
              value={formData.est_hour}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="employee-grid">
          <div>
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="To Do">To Do</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label>Resource Links & Attachments</label>
            <div className="attachment-block">
              <button
                type="button"
                className="project-attachment-link"
                onClick={handleLinkIconClick}
                title={formData.links ? "Open reference link" : "Add resource link"}
              >
                <img src="/link icon.svg" alt="link" className="icon-img" />
              </button>

              {showLinkInput && (
                <input
                  type="url"
                  name="links"
                  value={formData.links}
                  placeholder="https://resource-link.com"
                  onChange={handleChange}
                  className="small-link-input"
                />
              )}

              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
                multiple
              />
              <button
                type="button"
                className="project-attachment-link"
                onClick={handleAttachmentClick}
                title="Attach documentation"
              >
                <img src="/link.svg" alt="attachment" className="icon-img" />
              </button>
            </div>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="files-list">
            {attachments.map((f, i) => (
              <div key={i} className="file-item">
                <span>{f.name}</span>
                <button type="button" className="remove-file" onClick={() => handleRemoveAttachment(i)}>
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <label>Detailed Description</label>
        <textarea
          name="description"
          placeholder="Outline project goals, scope, and key deliverables..."
          value={formData.description}
          onChange={handleChange}
        />

        <div className="employee-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Project"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProject;
