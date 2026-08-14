import React, { useEffect, useState } from "react";
import "./LeavePolicy.css";
import api from "../../../../api/api.jsx";
import {
  FiAlertCircle,
  FiClock,
  FiCheck,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";

const POLICY_ICONS = [
  <FiAlertCircle />,
  <FiClock />,
  <FiCheck />,
  <FiCalendar />,
  <FiFileText />,
];

function LeavePolicy() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await api.get("admin_app/view-leave-policies/");
        const data = res.data || [];
        // Only show active policies
        const activePolicies = data.filter((p) => p.status === "active");
        setPolicies(activePolicies);
      } catch (err) {
        console.error("Failed to load leave policies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  return (
    <div className="leave-policy-card">
      <h3 className="policy-title">Leave Policy</h3>

      {loading ? (
        <div className="policy-loading">Loading policies...</div>
      ) : policies.length === 0 ? (
        <div className="policy-empty">
          No leave policies have been configured yet.
        </div>
      ) : (
        <div className="policy-list">
          {policies.map((policy, index) => (
            <div className="policy-item" key={policy.id}>
              <div className="policy-icon">
                {POLICY_ICONS[index % POLICY_ICONS.length]}
              </div>
              <div className="policy-content">
                <div className="policy-name">{policy.policy_name}</div>
                {policy.description && (
                  <div className="policy-text">{policy.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LeavePolicy;