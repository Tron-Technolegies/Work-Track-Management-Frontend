import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUsers, FiFolder, FiCheckSquare } from "react-icons/fi";
import api from "../../../api/api";
import "./TeamDetails.css";

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      setError("");

        const response = await api.get(
        `admin_app/view_team/${teamId}/details/`
        );

        console.log("Team details:", response.data);

        setTeam({
        ...response.data.team,

        members: response.data.members || [],
        projects: response.data.projects || [],
        tasks: response.data.tasks || [],

        summary: response.data.summary || {},
        });

        } catch (error) {
        console.error("Team details error:", error);

        setError(
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "Failed to load team details."
        );
        } finally {
        setLoading(false);
        }
    };

  if (loading) {
    return (
      <div className="team-details-container">
        <div className="team-details-loading">
          Loading team details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-details-container">
        <button
          className="team-back-btn"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Back
        </button>

        <div className="team-details-error">
          {error}
        </div>
      </div>
    );
  }

  if (!team) {
    return null;
  }

  return (
    <div className="team-details-container">

      {/* Header */}

      <div className="team-details-header">

        <button
          className="team-back-btn"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          Back
        </button>

        <div>
          <h1>{team.team_name}</h1>

          {team.description && (
            <p>{team.description}</p>
          )}
        </div>

      </div>


      {/* Team Summary */}

      <div className="team-summary-grid">

        <div className="team-summary-card">
          <FiUsers />

          <div>
            <span>Team Members</span>
            <strong>
              {team.members?.length || 0}
            </strong>
          </div>
        </div>


        <div className="team-summary-card">
          <FiFolder />

          <div>
            <span>Projects</span>
            <strong>
              {team.projects?.length || 0}
            </strong>
          </div>
        </div>


        <div className="team-summary-card">
          <FiCheckSquare />

          <div>
            <span>Tasks</span>
            <strong>
              {team.tasks?.length || 0}
            </strong>
          </div>
        </div>

      </div>


      {/* Team Lead */}

      <section className="team-details-section">

        <div className="section-heading">
          <h2>Team Lead</h2>
        </div>

        <div className="team-lead-card">

          <div className="team-member-avatar">
            {team.team_lead?.profile_picture ? (
              <img
                src={team.team_lead.profile_picture}
                alt={team.team_lead.name}
              />
            ) : (
              <span>
                {team.team_lead?.name?.charAt(0) || "T"}
              </span>
            )}
          </div>

          <div>
            <h3>
              {team.team_lead?.name || "Not assigned"}
            </h3>

            <p>
              {team.team_lead?.email || ""}
            </p>
          </div>

        </div>

      </section>


      {/* Members */}

      <section className="team-details-section">

        <div className="section-heading">
          <h2>Team Members</h2>
          <span>
            {team.members?.length || 0}
          </span>
        </div>

        <div className="team-members-grid">

          {team.members?.length ? (

            team.members.map((member) => (

              <div
                className="team-member-card"
                key={member.id}
              >

                <div className="team-member-avatar">

                  {member.profile_picture ? (
                    <img
                      src={member.profile_picture}
                      alt={member.name}
                    />
                  ) : (
                    <span>
                      {member.name?.charAt(0) || "U"}
                    </span>
                  )}

                </div>

                <div className="team-member-info">

                  <h3>{member.name}</h3>

                  <p>{member.email}</p>

                  <span>
                    {member.role === "project_lead"
                      ? "Project Lead"
                      : "Employee"}
                  </span>

                </div>

              </div>

            ))

          ) : (

            <div className="team-empty">
              No members assigned to this team.
            </div>

          )}

        </div>

      </section>


      {/* Projects */}

      <section className="team-details-section">

        <div className="section-heading">
          <h2>Projects</h2>
          <span>
            {team.projects?.length || 0}
          </span>
        </div>

        <div className="team-projects-list">

          {team.projects?.length ? (

            team.projects.map((project) => (

              <div
                className="team-project-card"
                key={project.id}
              >

                <div>
                  <h3>{project.project_name}</h3>

                  {project.description && (
                    <p>{project.description}</p>
                  )}
                </div>

                <span className="project-status">
                  {project.status || "Active"}
                </span>

              </div>

            ))

          ) : (

            <div className="team-empty">
              No projects assigned to this team.
            </div>

          )}

        </div>

      </section>


      {/* Tasks */}

      <section className="team-details-section">

        <div className="section-heading">
          <h2>Tasks</h2>
          <span>
            {team.tasks?.length || 0}
          </span>
        </div>

        <div className="team-tasks-list">

          {team.tasks?.length ? (

            team.tasks.map((task) => (

              <div
                className="team-task-card"
                key={task.id}
              >

                <div>
                  <h3>{task.task_name}</h3>

                  <p>
                    {task.project_name || "No project"}
                  </p>
                </div>

                <span className="task-status">
                  {task.status || "Pending"}
                </span>

              </div>

            ))

          ) : (

            <div className="team-empty">
              No tasks assigned to this team.
            </div>

          )}

        </div>

      </section>

    </div>
  );
};

export default TeamDetails;