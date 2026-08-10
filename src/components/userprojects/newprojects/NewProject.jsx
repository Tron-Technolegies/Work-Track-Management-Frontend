import React, { useRef, useEffect, useState } from "react";
import "./NewProject.css";
import { toast } from "react-toastify";
import api from "../../../api/api";
import { useNavigate } from "react-router-dom";

const NewProject = ({ isModal = false, onClose, onSuccess }) => {
  const navigate = useNavigate();

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

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [users, setUsers] = useState([]);
  const fileInputRef = useRef(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("admin_app/users/list/");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get("admin_app/view-teams/");
      setTeams(res.data.data || res.data);
    } catch {
      toast.error("Failed to load teams");
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

  const validateRequired = () => {
    const {
      project_name,
      description,
      team,
      assigned_to,
      due_date,
      est_hour
    } = formData;

    if (
      !project_name ||
      !description ||
      !team ||
      assigned_to.length === 0 ||
      !due_date ||
      !est_hour
    ) {
      toast.error("Please fill all required fields");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateRequired()) return;

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

      const res = await api.post("admin_app/projects/add/", payload);
      toast.success(res.data?.message || "Project launched successfully!");

      setFormData({
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

      setAttachments([]);

      if (isModal) {
        onSuccess && onSuccess();
        onClose && onClose();
      } else {
        navigate("/user/project");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to initialize project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-card">
      <div className="employee-header">
        <h2>Initialize New Project</h2>
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
            onClick={isModal ? onClose : () => navigate(-1)}
          >
            {isModal ? "Cancel" : "Discard Changes"}
          </button>
          <button
            type="submit"
            className="create-btn"
            disabled={loading}
          >
            {loading ? "Initializing..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProject;
