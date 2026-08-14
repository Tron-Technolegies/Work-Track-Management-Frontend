import React, { useState, useEffect } from "react";
import "../newTask/NewTask.css";
import "../../employees/createemployees/CreateEmployees.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../../../api/api";
import { FiX } from "react-icons/fi";

const NewTask = ({ isModal = false, onClose, onSuccess }) => {
  const navigate = useNavigate();

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

  const fetchUsers = async () => {
    try {
      const res = await api.get("admin_app/users/list/");
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load employees");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("admin_app/projects/dropdown/");
      setProjects(res.data);
    } catch (error) {
      toast.error("Failed to load projects");
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get("admin_app/view-teams/");
      setTeams(res.data.data || res.data);
    } catch (error) {
      toast.error("Failed to load teams");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.taskName.trim()) {
      toast.error("Task Name is required");
      return;
    }

    if (!formData.project) {
      toast.error("Project selection is required");
      return;
    }

    if (!formData.assignedTo) {
      toast.error("Assigned Employee is required");
      return;
    }

    if (!formData.dueDate) {
      toast.error("Due Date is required");
      return;
    }

    setLoading(true);

try {
  const payload = {
    project: Number(formData.project),
    task_name: formData.taskName.trim(),
    description: formData.description,
    due_date: formData.dueDate,
    working_hours: Number(formData.workingHours || 0),
    priority: formData.priority,
    status: formData.status || "Pending",
    assigned_to: [Number(formData.assignedTo)],
  };

  if (formData.team) {
    payload.team = Number(formData.team);
  }

  const res = await api.post(
    "admin_app/tasks/add/",
    payload
  );

  // =====================================
  // TASK CREATED SUCCESSFULLY
  // =====================================

  if (res.status === 201 || res.status === 200) {

    // Main success message
    toast.success(
      res.data?.message || "Task created successfully!"
    );

    // =====================================
    // Notification failed
    // Show separately
    // =====================================

    if (
      res.data?.notification_success === false &&
      res.data?.notification_errors?.length
    ) {
      toast.warning(
        "Task created successfully, but the notification could not be sent."
      );
    }

    // =====================================
    // Email failed
    // Show separately
    // =====================================

    if (
      res.data?.email_success === false &&
      res.data?.email_errors?.length
    ) {
      toast.warning(
        "Task created successfully, but the email could not be sent."
      );
    }

    // =====================================
    // Update UI immediately
    // =====================================

    if (isModal) {
      onSuccess && onSuccess(res.data?.data);
      onClose && onClose();
    } else {
      navigate("/user/tasks");
    }
  }

} catch (error) {

  console.error("ADD TASK ERROR:", error);

  const message =
    error.response?.data?.error ||
    error.response?.data?.message ||
    "Failed to add task";

  toast.error(message);

} finally {

  setLoading(false);

}
  }

  return (
    <div className="employee-card">
      <div className="employee-header">
        <h2>Create New Task</h2>
            {isModal && (
                <button
                    type="button"
                    className="close-btn"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <FiX />
                </button>
            )}
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
              onChange={handleChange}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Team (Optional)</label>
            <select
              name="team"
              value={formData.team}
              onChange={handleChange}
            >
              <option value="">Select Team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="employee-grid">
          <div>
            <label>Assigned To *</label>
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
            <label>Priority Level *</label>
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
            <label>Deadline *</label>
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
          placeholder="Add task description, goals, and requirements..."
          value={formData.description}
          onChange={handleChange}
        />

        <div className="employee-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={isModal ? onClose : () => navigate("/user/tasks")}
          >
            {isModal ? "Cancel" : "Discard"}
          </button>

          <button
            type="submit"
            className="create-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTask;
