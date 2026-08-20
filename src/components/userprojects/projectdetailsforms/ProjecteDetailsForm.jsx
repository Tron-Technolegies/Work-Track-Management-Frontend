import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import "./ProjecteDetailsForm.css";
import { toast } from "react-toastify";
import { FiLink, FiPaperclip } from "react-icons/fi";

const ProjectDetailsForm = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const [data, setData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // ------------ FETCH PROJECT & TEAMS ------------
  useEffect(() => {
    if (!id) return;

    api.get(`admin_app/projects/${id}/view/`)
      .then((res) => {
        console.log("PROJECT VIEW RESPONSE:", res.data);
        setData(res.data.project || res.data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        toast.error("Failed to load project details");
      });

    api.get("admin_app/active-teams/")
      .then((res) => {
        const data = res.data?.data || res.data || [];
        const activeTeams = Array.isArray(data)
          ? data.filter(t => (t.status || "").toLowerCase() === "active")
          : [];
        setTeams(activeTeams);
      })
      .catch(() => {});
  }, [id]);

  // ------------ LINK OPEN ------------
  const openLink = () => {
    if (!data?.links) {
      toast.info("No link available");
      return;
    }

    const url = data.links.startsWith("http")
      ? data.links
      : `https://${data.links}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openAttachment = () => {
    if (!data?.attachment_url) {
      toast.info("No attachment available");
      return;
    }

    window.open(
      data.attachment_url,
      "_blank",
      "noopener,noreferrer"
    );
  };
  // ------------ SAVE UPDATE ------------
  const handleSave = async (e) => {
    e?.preventDefault();
    if (!data) return;

    const form = new FormData();
    form.append("project_name", data.project_name || "");
    form.append("description", data.description || "");
    if (data.team?.id || data.team) {
      form.append("team", data.team?.id || data.team);
    }
    form.append("priority", data.priority || "Medium");
    form.append("due_date", data.due_date ? data.due_date.slice(0, 10) : "");
    form.append("est_hr", data.est_hour || 0);
    form.append("links", data.links || "");
    form.append("status", data.status || "Pending");

    try {
      setLoading(true);

      const res = await api.post(
        `admin_app/projects/${id}/update/`,
        form
      );

      toast.success(res.data?.message || "Updated Successfully");
      navigate("/user/project");
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Server Error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div style={{ padding: '30px' }}>Loading project details...</div>;

  return (
    <div>
      <div className="project-detail-title">Project Details</div>

      <div className="project-detail-container">
        {/* LEFT */}
        <div className="project-detail-leftform">
          <form onSubmit={(e) => e.preventDefault()}>
            <label>Project Name</label>
            <br />
            <input
              type="text"
              className="project-detail-input"
              value={data.project_name || ""}
              onChange={(e) =>
                setData({ ...data, project_name: e.target.value })
              }
            />

            <label>Team</label>
            <br />
            <select
              className="project-detail-input"
              value={data.team?.id || data.team || ""}
              onChange={(e) =>
                setData({ ...data, team: e.target.value })
              }
            >
              <option value="">Select Team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </select>

            <label>Description</label>
            <br />
            <textarea
              className="description"
              value={data.description || ""}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
            />
          </form>
        </div>

        {/* RIGHT */}
        <div className="project-detail-rightform">
          <form onSubmit={(e) => e.preventDefault()}>
            <label>Assigned to</label>
            <br />
            <input
              type="text"
              className="project-detail-input"
              readOnly
              value={
                Array.isArray(data.assigned_to)
                  ? data.assigned_to
                      .map((u) =>
                        typeof u === "object"
                          ? `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username
                          : u
                      )
                      .filter(Boolean)
                      .join(", ")
                  : data.assigned_to || "-"
              }
            />

            <div className="date-hour">
              <div className="est-hour">
                <label>Priority</label>
                <br />
                <select
                  className="esthour"
                  value={data.priority || "Medium"}
                  onChange={(e) =>
                    setData({ ...data, priority: e.target.value })
                  }
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="dates">
                <label>Due Date</label>
                <br />
                <input
                  type="date"
                  className="date"
                  value={data.due_date ? data.due_date.slice(0, 10) : ""}
                  onChange={(e) =>
                    setData({ ...data, due_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* LINKS & ATTACHMENTS */}
        {/* LINKS & ATTACHMENTS */}
          <div className="link-project">

            {/* PROJECT LINK */}
            <div
              className={`project-attachment-link ${
                !data.links ? "disabled" : ""
              }`}
              onClick={openLink}
              title={
                data.links
                  ? "Open project link"
                  : "No link available"
              }
            >
              <FiLink />
            </div>

            {/* ATTACHMENT */}
            <div
              className={`project-attachment-link ${
                !data.attachment_url ? "disabled" : ""
              }`}
              onClick={openAttachment}
              title={
                data.attachment_url
                  ? "Open attachment"
                  : "No attachment available"
              }
            >
              <FiPaperclip />
            </div>

          </div>
  
          </form>
        </div>
      </div>

      <div className="project-tasks-card">
        <h3>Project Tasks</h3>

        {data.tasks?.length > 0 ? (
          data.tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div>
                <strong>{task.task_name}</strong>
              </div>

              <div className="task-meta">
                <span className="priority-badge">{task.priority}</span>
                <span className="status-badge">{task.status}</span>
                <span className="due-badge">Due: {task.due_date || "-"}</span>
                <span className="time-spent-badge" style={{ background: "#f3e8ff", color: "#7e22ce", padding: "4px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "12px" }}>
                  ⏱ Time Spent: {task.time_spent || (task.working_hours ? `${task.working_hours}h` : "00h 00m")}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p>No tasks assigned to this project.</p>
        )}
      </div>

      {/* BUTTONS */}
      <div className="form-buttons">
        <button
          type="button"
          className="cancel-btnn"
          onClick={() => navigate("/user/project")}
        >
          Cancel
        </button>

        <button
          type="button"
          className="save-btn"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailsForm;
