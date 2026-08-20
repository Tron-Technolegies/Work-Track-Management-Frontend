import React, { useState, useEffect } from "react";
import "../../employees/createemployees/CreateEmployees.css";
import { toast } from "react-toastify";
import api from "../../../api/api";
import { FiX } from "react-icons/fi";

function EditTask({ task, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);

  const [formData, setFormData] = useState({
    project: "",
    taskName: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    workingHours: "",
    priority: "Medium",
    status: "Pending",
    team: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (task) {
      if (task.id) {
        fetchTaskDetails(task.id);
      }
    }
  }, [task]);

  const fetchTaskDetails = async (id) => {
    try {
      const res = await api.get(`admin_app/tasks/${id}/view/`);
      const t = res.data.task || res.data;
      setFormData({
        project: t.project?.id || t.project || "",
        taskName: t.task_name || "",
        description: t.description || "",
        assignedTo: Array.isArray(t.assigned_to) && t.assigned_to.length > 0
          ? (typeof t.assigned_to[0] === "object" ? t.assigned_to[0].id : t.assigned_to[0])
          : "",
        dueDate: t.due_date ? t.due_date.slice(0, 10) : "",
        workingHours: t.working_hours || 0,
        priority: t.priority || "Medium",
        status: t.status || "Pending",
        team: t.team?.id || t.team || "",
      });
    } catch {
      setFormData({
        project: task.project?.id || task.project || "",
        taskName: task.task_name || "",
        description: task.description || "",
        assignedTo: Array.isArray(task.assigned_to) && task.assigned_to.length > 0
          ? (typeof task.assigned_to[0] === "object" ? task.assigned_to[0].id : task.assigned_to[0])
          : "",
        dueDate: task.due_date ? task.due_date.slice(0, 10) : "",
        workingHours: task.working_hours || 0,
        priority: task.priority || "Medium",
        status: task.status || "Pending",
        team: task.team?.id || task.team || "",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("admin_app/users/list/");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("admin_app/projects/dropdown/");
      setProjects(res.data);
    } catch {
      toast.error("Failed to load projects");
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get("admin_app/active-teams/");
      const data = res.data?.data || res.data || [];
      const activeTeams = Array.isArray(data)
        ? data.filter((t) => (t.status || "").toLowerCase() === "active")
        : [];
      setTeams(activeTeams);
    } catch {
      toast.error("Failed to load teams");
    }
  };

  const handleProjectChange = (e) => {
    const selectedProjectId = e.target.value;
    if (!selectedProjectId) {
      setFormData((prev) => ({ ...prev, project: "" }));
      return;
    }

    const selectedProj = projects.find(
      (p) => String(p.id) === String(selectedProjectId)
    );
    const teamId =
      selectedProj?.team || selectedProj?.team_id
        ? String(selectedProj.team || selectedProj.team_id)
        : "";

    setFormData((prev) => ({
      ...prev,
      project: selectedProjectId,
      team: teamId,
    }));
  };

  const handleTeamChange = (e) => {
    const selectedTeamId = e.target.value;
    if (!selectedTeamId) {
      setFormData((prev) => ({ ...prev, team: "" }));
      return;
    }

    const currentProj = projects.find(
      (p) => String(p.id) === String(formData.project)
    );
    const currentProjTeamId = currentProj
      ? String(currentProj.team || currentProj.team_id)
      : "";
    const isMatching = currentProjTeamId === String(selectedTeamId);

    setFormData((prev) => ({
      ...prev,
      team: selectedTeamId,
      project: isMatching ? prev.project : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Filter projects based on selected team
  const displayedProjects = formData.team
    ? projects.filter(
        (p) => String(p.team || p.team_id) === String(formData.team)
      )
    : projects;

  // Filter teams based on selected project
  const displayedTeams = (() => {
    if (!formData.project) return teams;
    const selectedProj = projects.find(
      (p) => String(p.id) === String(formData.project)
    );
    if (!selectedProj || (!selectedProj.team && !selectedProj.team_id)) {
      return [];
    }
    const teamId = String(selectedProj.team || selectedProj.team_id);
    const matched = teams.filter((t) => String(t.id) === teamId);
    if (matched.length > 0) return matched;
    if (selectedProj.team_name) {
      return [{ id: teamId, team_name: selectedProj.team_name }];
    }
    return teams;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.taskName || !formData.project) {
      toast.error("Task Name and Project are required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        project: Number(formData.project),
        task_name: formData.taskName,
        description: formData.description,
        due_date: formData.dueDate,
        working_hours: Number(formData.workingHours || 0),
        priority: formData.priority,
        status: formData.status,
      };

      if (formData.assignedTo) {
        payload.assigned_to = [Number(formData.assignedTo)];
      }

      if (formData.team) {
        payload.team = Number(formData.team);
      }

      const res = await api.post(`admin_app/tasks/${task.id}/update/`, payload);

      toast.success(
        res.data?.message || "Task updated successfully!"
      );

      window.dispatchEvent(new Event("task-updated"));
      window.dispatchEvent(new Event("task-status-updated"));

      onSuccess && onSuccess(res.data?.data);
      onClose && onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Unable to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-card">
      <div className="employee-header">
        <h2>Edit Task</h2>
            <button
                type="button"
                className="close-btn"
                onClick={onClose}
                aria-label="Close"
            >
                <FiX />
            </button>
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <label>Task Name *</label>
        <input
          type="text"
          name="taskName"
          placeholder="Enter task name..."
          value={formData.taskName}
          onChange={handleChange}
        />

        <div className="employee-grid">
          <div>
            <label>Project *</label>
            <select
              name="project"
              value={formData.project}
              onChange={handleProjectChange}
            >
              <option value="">Select Project</option>
              {displayedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Team (Optional)</label>
            <select
              name="team"
              value={formData.team}
              onChange={handleTeamChange}
            >
              <option value="">Select Team</option>
              {displayedTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="employee-grid">
          <div>
            <label>Assigned To</label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
            >
              <option value="">Select Employee</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name}
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
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="employee-grid">
          <div>
            <label>Deadline</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Est. Hours</label>
            <input
              type="number"
              name="workingHours"
              min="0"
              placeholder="e.g. 8"
              value={formData.workingHours}
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
        </div>

        <label>Detailed Description</label>
        <textarea
          name="description"
          placeholder="Add task description..."
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
            {loading ? "Updating..." : "Update Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTask;
