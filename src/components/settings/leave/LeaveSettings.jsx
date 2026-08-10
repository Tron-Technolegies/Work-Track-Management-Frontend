import React, { useEffect, useState } from "react";
import "./LeaveSettings.css";
import api from "../../../api/api.jsx";
import { toast } from "react-toastify";
import { FiCalendar, FiSave, FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

function LeaveSettings() {
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    policy_name: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin_app/view-leave-policies/");
      setPolicies(res.data || []);
    } catch (err) {
      console.error("Failed to load leave policies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (policy = null) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormData({
        policy_name: policy.policy_name || "",
        description: policy.description || "",
        status: policy.status || "active",
      });
    } else {
      setEditingPolicy(null);
      setFormData({ policy_name: "", description: "", status: "active" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPolicy(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.policy_name.trim()) {
      toast.error("Policy name is required");
      return;
    }

    try {
      setSubmitting(true);
      if (editingPolicy) {
        const res = await api.put(`admin_app/update-leave-policy/${editingPolicy.id}/`, formData);
        toast.success(res.data?.message || "Leave policy updated successfully");
      } else {
        const res = await api.post("admin_app/create-leave-policy/", formData);
        toast.success(res.data?.message || "Leave policy created successfully");
      }
      handleCloseModal();
      loadPolicies();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save leave policy";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this leave policy?")) return;
    try {
      await api.delete(`admin_app/delete-leave-policy/${id}/`);
      toast.success("Leave policy deleted successfully");
      loadPolicies();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete leave policy";
      toast.error(msg);
    }
  };

  return (
    <div className="leave-page">
      <div className="leave-card">
        <div className="admin-leave-header">
          <div>
            <h2>Leave Policies</h2>
            <p>Manage leave policies for your company.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <FiCalendar className="leave-icon" />
            <button
              onClick={() => handleOpenModal()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "#8b5cf6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              <FiPlus size={15} /> New Policy
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#94a3b8", padding: "20px 0" }}>Loading policies...</p>
        ) : policies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            <FiCalendar size={36} style={{ opacity: 0.4, marginBottom: "8px" }} />
            <p>No leave policies created yet. Click "New Policy" to start.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {policies.map((policy) => (
              <div
                key={policy.id}
                style={{
                  background: "rgba(241, 245, 249, 0.8)",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid rgba(226, 232, 240, 0.7)",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontWeight: "600", color: "#1e293b" }}>
                    {policy.policy_name}
                    <span
                      style={{
                        marginLeft: "10px",
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        background: policy.status === "active" ? "#dcfce7" : "#fee2e2",
                        color: policy.status === "active" ? "#166534" : "#991b1b",
                        fontWeight: "500",
                      }}
                    >
                      {policy.status || "active"}
                    </span>
                  </h4>
                  {policy.description && (
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                      {policy.description}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleOpenModal(policy)}
                    title="Edit Policy"
                    style={{
                      padding: "6px",
                      background: "rgba(139, 92, 246, 0.1)",
                      color: "#8b5cf6",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <FiEdit2 size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(policy.id)}
                    title="Delete Policy"
                    style={{
                      padding: "6px",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "28px",
              width: "440px",
              boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#1e293b" }}>
                {editingPolicy ? "Edit Leave Policy" : "Create Leave Policy"}
              </h3>
              <button onClick={handleCloseModal} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <FiX size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#475569", marginBottom: "6px", fontWeight: "500" }}>
                  Policy Name *
                </label>
                <input
                  type="text"
                  name="policy_name"
                  value={formData.policy_name}
                  onChange={handleChange}
                  placeholder="e.g. Standard Leave Policy"
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "7px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#475569", marginBottom: "6px", fontWeight: "500" }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe the leave policy..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "7px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#475569", marginBottom: "6px", fontWeight: "500" }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "7px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "7px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "7px",
                    border: "none",
                    background: "#8b5cf6",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {submitting ? "Saving..." : editingPolicy ? "Update Policy" : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveSettings;