import React, { useEffect, useState } from "react";
import "./Teams.css";
import api, { getErrorMessage } from "../../api/api";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiUserCheck, FiUsers, FiX } from "react-icons/fi";
import ConfirmationModal from "../confirmationmodal/ConfirmationModal";
import { useNavigate } from "react-router-dom";
const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const userRole = localStorage.getItem("user_role");
  const isAdmin = userRole === "admin" || userRole === "super_admin";
  const [deleteTeam, setDeleteTeam] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    team_name: "",
    description: "",
    team_lead: "",
    status: "active",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeams();
    if (isAdmin) {
      fetchTeamLeads();
    }
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin_app/view-teams/");
      setTeams(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error fetching teams:", err);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamLeads = async () => {
    try {

      const res = await api.get(
        "admin_app/team-leads/"
      );

      setTeamLeads(res.data);

    } catch (err) {

      toast.error("Unable to load Team Leads.");

    }
  };

  const handleOpenModal = (team = null) => {
    if (!isAdmin) {
      toast.error("Only Admins can manage teams");
      return;
    }
    if (team) {
      setEditingTeam(team);
      setFormData({
        team_name: team.team_name || "",
        description: team.description || "",
        team_lead: team.team_lead || "",
        status: team.status || "active",
      });
    } else {
      setEditingTeam(null);
      setFormData({
        team_name: "",
        description: "",
        team_lead: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.team_name.trim()) {
            toast.error("Team Name is required");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                team_name: formData.team_name.trim(),
                description: formData.description,
                status: formData.status,
                team_lead: formData.team_lead || null,
            };

            if (editingTeam) {

                const res = await api.put(
                    `admin_app/update-team/${editingTeam.id}/`,
                    payload
                );

                toast.success(
                    res.data?.message || "Team updated successfully"
                );

            } else {

                const res = await api.post(
                    "admin_app/create-team/",
                    payload
                );

                toast.success(
                    res.data?.message || "Team created successfully"
                );
            }

            // Get the latest data from backend
            await fetchTeams();

            // Close modal only after the list is updated
            handleCloseModal();

        } catch (err) {
            console.error("Team save error:", err);
            toast.error(getErrorMessage(err, "Unable to save team."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTeam = async () => {
        if (!deleteTeam) return;

        try {
            setDeleting(true);

            const res = await api.delete(
                `admin_app/delete-team/${deleteTeam.id}/`
            );

            toast.success(
                res.data?.message || "Team deleted successfully"
            );

            setDeleteTeam(null);
            fetchTeams();

        } catch (err) {
            const msg =
                err.response?.data?.error ||
                "Failed to delete team";

            toast.error(msg);

        } finally {
            setDeleting(false);
        }
    };

  return (
    <div className="teams-page">
      <div className="teams-top-bar">
        <div className="teams-header">
          <h2>Teams</h2>
          <p className="teams-subtitle">View active teams and assigned Team Leads.</p>
        </div>

        {isAdmin && (
          <button className="add-team-btn" onClick={() => handleOpenModal()}>
            <FiPlus size={18} />Create Team
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: "#94a3b8", padding: "40px 0" }}>Loading teams...</div>
      ) : teams.length === 0 ? (
        <div style={{ color: "#64748b", padding: "60px 0", textAlign: "center", background: "rgba(15, 23, 42, 0.4)", borderRadius: "16px" }}>
          <FiUsers size={48} style={{ opacity: 0.4, marginBottom: "12px" }} />
          <h3>No Teams Created Yet</h3>
          {isAdmin && <p>Click "+ Create Team" to setup your first team and assign a Team Lead.</p>}
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div className="team-card" onClick={() => navigate(`/user/team_details/${team.id}`)} key={team.id}>
              <div>
                <div className="team-card-header">
                  <h3 className="team-card-name">{team.team_name}</h3>
                  <span className={`team-status-pill ${team.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                    {team.status || "active"}
                  </span>
                </div>

                <p className="team-description">
                  {team.description || "No description provided."}
                </p>

                <div className="team-lead-info">
                  <FiUserCheck className="team-lead-icon" />
                  <div>
                    <div className="team-lead-label">Team Lead</div>
                    <div className="team-lead-name">
                      {team.team_lead_name || "Unassigned"}
                    </div>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="team-card-actions">
                  <button
                    className="action-icon-btn"
                    title="Edit Team"
                      onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(team);
                        }}
                  >
                    <FiEdit2 size={16} />
                  </button>
              <button
                  className="action-icon-btn delete"
                  title="Delete Team"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTeam(team);
                    }}
              >
                  <FiTrash2 size={16} />
              </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT TEAM MODAL */}
      {isModalOpen && (
        <div className="teams-modal-overlay" >
          <div className="teams-modal-card" >
            <div className="teams-modal-header">
              <h3>{editingTeam ? "Edit Team" : "Create New Team"}</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="team-form-field">
                <label>Team Name *</label>
                <input
                  type="text"
                  name="team_name"
                  className="team-form-input"
                  placeholder="e.g. Engineering, Sales, Splyzone"
                  value={formData.team_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="team-form-field">
                <label>Description</label>
                <textarea
                  name="description"
                  className="team-form-input"
                  rows="3"
                  placeholder="Describe the team's primary role or objective..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="team-form-field">
                <label>Assign Team Lead</label>
                <select
                  name="team_lead"
                  className="team-form-input"
                  value={formData.team_lead}
                  onChange={handleChange}
                >
                  <option value="">-- Select Team Lead --</option>
                  {teamLeads.map((user) => (
                  <option
                      key={user.id}
                      value={user.id}
                  >
                      {user.first_name} {user.last_name}
                  </option>
                  ))}
                </select>
              </div>

              <div className="team-form-field">
                <label>Status</label>
                <select
                  name="status"
                  className="team-form-input"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="teams-modal-actions">
                <button type="button" className="cancel-modal-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-modal-btn" disabled={submitting}>
                  {submitting ? "Saving..." : editingTeam ? "Update Team" : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmationModal
    isOpen={!!deleteTeam}
    title="Delete Team"
    message={
        deleteTeam
            ? `Are you sure you want to delete "${deleteTeam.team_name}"? This action cannot be undone.`
            : ""
    }
    onConfirm={handleDeleteTeam}
    onCancel={() => setDeleteTeam(null)}
    loading={deleting}
/>
    </div>
  );
};

export default Teams;
