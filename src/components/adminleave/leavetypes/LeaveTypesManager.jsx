import React, { useState, useEffect } from "react";
import LeaveHeader from "../../leaveheader/LeaveHeader";
import api, { getErrorMessage } from "../../../api/api";
import { toast } from "react-toastify";
import {
  FiSliders,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiCalendar,
  FiInfo,
  FiDollarSign,
  FiSearch,
} from "react-icons/fi";
import "./LeaveTypesManager.css";
import { createPortal } from "react-dom";

function LeaveTypesManager() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    days_per_year: 12,
    is_paid: true,
    allow_half_day: true,
    status: "active",
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin_app/leave-types/?all=true");
      setLeaveTypes(res.data || []);
    } catch (err) {
      console.error("Error fetching leave types:", err);
      toast.error(getErrorMessage(err, "Failed to load leave types"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (leaveType = null) => {
    if (leaveType) {
      setEditingType(leaveType);
      setFormData({
        name: leaveType.name || "",
        description: leaveType.description || "",
        days_per_year: leaveType.days_per_year ?? 12,
        is_paid: leaveType.is_paid ?? true,
        allow_half_day: leaveType.allow_half_day ?? false,
        status: leaveType.status || (leaveType.is_active ? "active" : "inactive"),
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        description: "",
        days_per_year: 12,
        is_paid: true,
        allow_half_day: true,
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Leave type name is required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        days_per_year: parseInt(formData.days_per_year, 10) || 0,
        is_paid: Boolean(formData.is_paid),
        allow_half_day: Boolean(formData.allow_half_day),
        is_active: formData.status === "active",
        status: formData.status,
      };

      if (editingType) {
        await api.put(`admin_app/leave-types/update/${editingType.id}/`, payload);
        toast.success("Leave type updated successfully!");
      } else {
        await api.post("admin_app/leave-types/create/", payload);
        toast.success("Leave type created successfully!");
      }

      handleCloseModal();
      await fetchLeaveTypes();
    } catch (err) {
      console.error("Error saving leave type:", err);
      toast.error(getErrorMessage(err, "Failed to save leave type"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (leaveType) => {
    const newStatus = leaveType.status === "active" || leaveType.is_active ? "inactive" : "active";
    const newIsActive = newStatus === "active";

    try {
      await api.put(`admin_app/leave-types/update/${leaveType.id}/`, {
        status: newStatus,
        is_active: newIsActive,
      });
      toast.success(`Leave type marked as ${newStatus}`);
      fetchLeaveTypes();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update leave type status"));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await api.delete(
        `admin_app/leave-types/delete/${deleteConfirm.id}/`
      );

      toast.success("Leave type deactivated successfully");

      setDeleteConfirm(null);

      await fetchLeaveTypes();

    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Failed to deactivate leave type"
        )
      );
    }
  };

  const filteredTypes = leaveTypes.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTypes = leaveTypes.length;
  const activeTypes = leaveTypes.filter((t) => t.is_active && t.status !== "inactive").length;
  const paidTypes = leaveTypes.filter((t) => t.is_paid).length;
  const unpaidTypes = totalTypes - paidTypes;

  return (
    <div className="leave-types-manager animate-fade-in">
      <LeaveHeader
        category="ADMIN PANEL"
        title="Leave Types Management"
        subtitle="Configure, edit, and manage all company leave types, allowance days, and rules."
      />

      {/* Stats Section */}
      <div className="lt-stats-grid">
        <div className="lt-stat-card">
          <div className="stat-icon purple">
            <FiSliders />
          </div>
          <div>
            <h3>{totalTypes}</h3>
            <p>Total Leave Types</p>
          </div>
        </div>

        <div className="lt-stat-card">
          <div className="stat-icon green">
            <FiCheckCircle />
          </div>
          <div>
            <h3>{activeTypes}</h3>
            <p>Active Leave Types</p>
          </div>
        </div>

        <div className="lt-stat-card">
          <div className="stat-icon blue">
            <FiDollarSign />
          </div>
          <div>
            <h3>{paidTypes}</h3>
            <p>Paid Leave Types</p>
          </div>
        </div>

        <div className="lt-stat-card">
          <div className="stat-icon orange">
            <FiCalendar />
          </div>
          <div>
            <h3>{unpaidTypes}</h3>
            <p>Unpaid / Special Types</p>
          </div>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="lt-toolbar">
        <div className="lt-search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search leave types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="lt-create-btn" onClick={() => handleOpenModal()}>
          <FiPlus size={18} />
          <span>Add Leave Type</span>
        </button>
      </div>

      {/* Leave Types Table Container */}
      <div className="lt-table-wrapper">
        {loading ? (
          <div className="lt-loading-state">
            <div className="spinner"></div>
            <p>Loading leave types...</p>
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="lt-empty-state">
            <FiInfo size={40} className="empty-icon" />
            <h3>No Leave Types Found</h3>
            <p>Click "Add Leave Type" to create your first leave configuration.</p>
          </div>
        ) : (
          <table className="lt-table">
            <thead>
              <tr>
                <th>Leave Type Name</th>
                <th>Description</th>
                <th>Days / Year</th>
                <th>Pay Status</th>
                <th>Half-Day</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((type) => {
                const isActive = type.is_active && type.status !== "inactive";
                return (
                  <tr key={type.id} className={!isActive ? "row-inactive" : ""}>
                    <td className="font-bold text-dark">
                      <div className="type-name-cell">
                        <span className="type-dot"></span>
                        {type.name}
                      </div>
                    </td>
                    <td className="text-muted text-sm">
                      {type.description || <span className="text-gray-400">No description</span>}
                    </td>
                    <td>
                      <span className="days-badge">
                        {type.days_per_year} Days
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${type.is_paid ? "paid" : "unpaid"}`}>
                        {type.is_paid ? "Paid Leave" : "Unpaid Leave"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${type.allow_half_day ? "allowed" : "disallowed"}`}>
                        {type.allow_half_day ? "Allowed" : "No"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`status-toggle-btn ${isActive ? "active" : "inactive"}`}
                        onClick={() => handleToggleStatus(type)}
                        title="Click to toggle status"
                      >
                        {isActive ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />}
                        <span>{isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td>
                      <div className="lt-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => handleOpenModal(type)}
                          title="Edit Leave Type"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() =>
                                setDeleteConfirm({
                                  id: type.id,
                                  name: type.name,
                                })
                              }
                          title="Deactivate Leave Type"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
          {isModalOpen && 
          createPortal(
            <div
              className="lt-modal-overlay"
              onClick={handleCloseModal}
            >
              <div
                className="lt-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="lt-modal-header">
                  <h3>
                    {editingType
                      ? "Edit Leave Type"
                      : "Create New Leave Type"}
                  </h3>

                  <button
                    className="close-btn"
                    onClick={handleCloseModal}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="lt-modal-form"
                >
                  <div className="form-group">
                    <label>Leave Type Name *</label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Casual Leave, Sick Leave, Annual Leave"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>

                    <textarea
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Details about when this leave can be taken..."
                    />
                  </div>

                  <div className="form-row">

                    <div className="form-group flex-1">
                      <label>Days Allowed / Year *</label>

                      <input
                        type="number"
                        name="days_per_year"
                        min="0"
                        max="365"
                        value={formData.days_per_year}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label>Status *</label>

                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                  </div>

                  <div className="checkbox-row">

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_paid"
                        checked={formData.is_paid}
                        onChange={handleChange}
                      />

                      <span>Paid Leave</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="allow_half_day"
                        checked={formData.allow_half_day}
                        onChange={handleChange}
                      />

                      <span>Allow Half Day</span>
                    </label>

                  </div>

                  <div className="lt-modal-footer">

                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="save-btn"
                      disabled={submitting}
                    >
                      {submitting
                        ? "Saving..."
                        : editingType
                        ? "Update Type"
                        : "Create Type"}
                    </button>

                  </div>

                </form>
              </div>
            </div>,
            document.body
          )}

          {/* Deactivate Confirmation Modal */}
          {deleteConfirm && 
            createPortal(
            <div
              className="lt-confirm-overlay"
              onClick={() => setDeleteConfirm(null)}
            >
              <div
                className="lt-confirm-card"
                onClick={(e) => e.stopPropagation()}
              >

                <div className="lt-confirm-icon">
                  <FiTrash2 size={24} />
                </div>

                <div className="lt-confirm-content">

                  <h3>Deactivate Leave Type?</h3>

                  <p>
                    Are you sure you want to deactivate{" "}
                    <strong>"{deleteConfirm.name}"</strong>?
                  </p>

                  <span>
                    This leave type will no longer be available for
                    new leave applications. Existing records will not
                    be deleted.
                  </span>

                </div>

                <div className="lt-confirm-actions">

                  <button
                    type="button"
                    className="lt-confirm-cancel"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="lt-confirm-delete"
                    onClick={handleDelete}
                  >
                    <FiTrash2 size={15} />
                    Deactivate
                  </button>

                </div>

              </div>
            </div>,
            document.body
          )}
    </div>
  );
}

export default LeaveTypesManager;
