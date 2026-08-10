import React, { useEffect, useState } from "react";
import "./OnboardingSteps.css";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import { FiCheck, FiArrowRight, FiUsers, FiUserCheck } from "react-icons/fi";

const OnboardingSteps = () => {
  const navigate = useNavigate();
  const [usersCount, setUsersCount] = useState(0);
  const [teamsCount, setTeamsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const userRole = localStorage.getItem("user_role");
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, teamsRes] = await Promise.allSettled([
        api.get("admin_app/users/list/"),
        api.get("admin_app/view-teams/"),
      ]);

      if (usersRes.status === "fulfilled") {
        setUsersCount(usersRes.value.data?.length || 0);
      }
      if (teamsRes.status === "fulfilled") {
        const teamsData = teamsRes.value.data?.data || teamsRes.value.data || [];
        setTeamsCount(teamsData.length || 0);
      }
    } catch (err) {
      console.error("Error fetching onboarding stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin || dismissed || loading) return null;

  const hasUsers = usersCount > 1;
  const hasTeams = teamsCount > 0;

  return (
    <div className="onboarding-banner">
      <div className="onboarding-title-row">
        <div>
          <h3>🚀 Welcome to WorkTrack Management!</h3>
          <p>Complete the setup workflow below to onboard your team and start tracking work.</p>
        </div>
        <button className="dismiss-btn" onClick={() => setDismissed(true)}>
          Minimize
        </button>
      </div>

      <div className="steps-grid">
        {/* STEP 1: Company Signup */}
        <div className="step-card completed">
          <div className="step-badge">
            <FiCheck />
          </div>
          <div className="step-info">
            <h4>1. Company Created</h4>
            <p>Your company profile and admin credentials have been registered.</p>
          </div>
        </div>

        {/* STEP 2: Create Users */}
        <div className={`step-card ${hasUsers ? "completed" : "active"}`}>
          <div className="step-badge">
            {hasUsers ? <FiCheck /> : "2"}
          </div>
          <div className="step-info">
            <h4>2. Create Users ({usersCount} User{usersCount !== 1 ? 's' : ''})</h4>
            <p>Add employees and project leads under your company.</p>
            <button className="step-action-btn" onClick={() => navigate("/user/employees")}>
              <FiUsers size={14} /> Manage Users <FiArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* STEP 3: Create Teams */}
        <div className={`step-card ${hasTeams ? "completed" : hasUsers ? "active" : ""}`}>
          <div className="step-badge">
            {hasTeams ? <FiCheck /> : "3"}
          </div>
          <div className="step-info">
            <h4>3. Create Teams ({teamsCount} Team{teamsCount !== 1 ? 's' : ''})</h4>
            <p>Setup teams and assign Team Leads for project management.</p>
            <button className="step-action-btn" onClick={() => navigate("/user/teams")}>
              <FiUserCheck size={14} /> Manage Teams <FiArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSteps;
