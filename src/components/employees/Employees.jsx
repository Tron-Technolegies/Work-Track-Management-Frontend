import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiKey, FiDownload } from "react-icons/fi";
import api from "../../api/api";
import "./Employees.css";
import CreateEmployeeModal from "./createemployees/CreateEmployeeModal";
import EditEmployeeModal from "./editemployee/EditEmployeeModal";
import ConfirmationModal from "../confirmationmodal/ConfirmationModal";
import { toast } from "react-toastify";

function Employees() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const userRole = localStorage.getItem("user_role") || "";
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  const getUsers = async (teamId = selectedTeam) => {
    try {
      let url = "admin_app/users/";
      if (isAdmin && teamId && teamId !== "all") {
        url += `?team_id=${teamId}`;
      }
      const res = await api.get(url);
      setUsers(res.data);
    } catch (err) {
      console.log("Failed to fetch users", err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get("admin_app/view-teams/");
      setTeams(res.data?.data || res.data || []);
    } catch (err) {
      console.log("Failed to fetch teams", err);
    }
  };

  useEffect(() => {
    getUsers(selectedTeam);
  }, [selectedTeam]);

  useEffect(() => {
    if (isAdmin) {
      fetchTeams();
    }
  }, [isAdmin]);

  const handleTeamChange = (e) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);
  };

  const handleExportExcel = async () => {
    try {
      let url = "admin_app/export/employees/excel/";
      if (isAdmin && selectedTeam && selectedTeam !== "all") {
        url += `?team_id=${selectedTeam}`;
      }
      const res = await api.get(url, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", "employees_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Excel report downloaded");
    } catch (err) {
      toast.error("Failed to export Excel report");
    }
  };

  const handleExportPDF = async () => {
    try {
      let url = "admin_app/export/employees/pdf/";
      if (isAdmin && selectedTeam && selectedTeam !== "all") {
        url += `?team_id=${selectedTeam}`;
      }
      const res = await api.get(url, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", "employees_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF report downloaded");
    } catch (err) {
      toast.error("Failed to export PDF report");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setResetting(true);
      await api.put(`admin_app/reset-employee-password/${resetModalUser.id}/`, {
        new_password: newPassword,
      });
      toast.success("Password reset successfully!");
      setResetModalUser(null);
      setNewPassword("");
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to reset password";
      toast.error(msg);
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;

    try {
        setDeleting(true);

        const res = await api.delete(
            `admin_app/users/${deleteUser.id}/delete/`
        );

        toast.success(
            res.data?.message || "Employee deleted successfully"
        );

        setDeleteUser(null);
        getUsers();

    } catch (err) {
        toast.error(
            err.response?.data?.error ||
            "Unable to delete employee"
        );
    } finally {
        setDeleting(false);
    }
};

  return (
    <div className="users-table-container">
      <div className="users-table-header">
        <h2>Employees</h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {isAdmin && teams.length > 0 && (
            <select
              value={selectedTeam}
              onChange={handleTeamChange}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                fontWeight: "500",
                fontSize: "14px",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </select>
          )}

          {isAdmin && (
            <>
              <button
                className="add-user-btn"
                onClick={handleExportExcel}
                style={{ background: "#10B981" }}
                title="Export Employees to Excel"
              >
                <FiDownload /> Excel
              </button>

              <button
                className="add-user-btn"
                onClick={handleExportPDF}
                style={{ background: "#EF4444" }}
                title="Export Employees to PDF"
              >
                <FiDownload /> PDF
              </button>

              <button className="add-user-btn" onClick={() => setIsModalOpen(true)}>
                + Add User
              </button>
            </>
          )}
        </div>
      </div>

      <CreateEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={getUsers}
      />

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSuccess={getUsers}
      />
      <ConfirmationModal
        isOpen={!!deleteUser}
        title="Delete Employee"
        message={
            deleteUser
                ? `Are you sure you want to delete ${
                      deleteUser.first_name ||
                      deleteUser.username ||
                      "this employee"
                  }? This action cannot be undone.`
                : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteUser(null)}
        loading={deleting}
    />

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "12px",
              width: "360px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginBottom: "8px", color: "#1e293b" }}>Reset Password</h3>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
              Reset password for <strong>{resetModalUser.first_name || resetModalUser.username}</strong>
            </p>

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#475569", marginBottom: "6px" }}>
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#8b5cf6",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  {resetting ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Team</th>
              <th>Email</th>
              <th>Mobile</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 8} className="empty-row">
                  No Users Found
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id}>

                  {/* ID */}
                  <td>
                    {index + 1}
                  </td>

                  {/* EMPLOYEE */}
                  <td>
                    <div className="employee-info">

                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt={user.first_name || "Employee"}
                          className="user-avatar"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.first_name?.charAt(0)?.toUpperCase() ||
                            user.username?.charAt(0)?.toUpperCase() ||
                            "E"}
                        </div>
                      )}

                      <div className="employee-name-wrapper">
                        <span className="employee-name">
                          {`${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                            user.username ||
                            "Employee"}
                        </span>
                      </div>

                    </div>
                  </td>

                  {/* FIRST NAME */}
                  <td>
                    {user.first_name || "-"}
                  </td>

                  {/* LAST NAME */}
                  <td>
                    {user.last_name || "-"}
                  </td>

                  {/* ROLE */}
                  <td>
                    <span
                      className={`role-badge ${
                        user.role?.toLowerCase() === "project_lead"
                          ? "project-lead"
                          : "employee"
                      }`}
                    >
                      {user.role?.toLowerCase() === "project_lead"
                        ? "Project Lead"
                        : "Employee"}
                    </span>
                  </td>

                  {/* TEAM */}
                  <td>
                    {user.team_name || "-"}
                  </td>

                  {/* EMAIL */}
                  <td>
                    {user.email || "-"}
                  </td>

                  {/* MOBILE */}
                  <td>
                    {user.mobile || "-"}
                  </td>

                  {/* ACTION */}
                  {isAdmin && (
                    <td className="action-cell">
                      <button
                        className="icon-btn edit-btn"
                        title="Edit Employee"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <FiEdit2 />
                      </button>

                      <button
                        className="icon-btn delete-btn"
                        title="Delete Employee"
                        onClick={() => setDeleteUser(user)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  )}

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Employees;