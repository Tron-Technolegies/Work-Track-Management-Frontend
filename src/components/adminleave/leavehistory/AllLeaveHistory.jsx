import React, { useEffect, useState, useMemo } from "react";
import "./AllLeaveHistory.css";
import {
  FiSearch,
  FiClock,
  FiCheck,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiUser,
  FiCalendar,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../../api/api";
import { toast } from "react-toastify";

const LEAVE_TYPE_LABEL_MAP = {
  casual: "Casual Leave",
  sick: "Sick Leave",
  earned: "Earned Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  work_from_home: "Work From Home",
  half_day: "Half Day",
  comp_off: "Compensatory Off",
  loss_of_pay: "Loss of Pay",
  bereavement: "Bereavement Leave",
};

function AllLeaveHistory() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [leaveData, setLeaveData] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, typesRes] = await Promise.allSettled([
        api.get("admin_app/leave-requests/"),
        api.get("admin_app/leave-types/"),
      ]);

      if (requestsRes.status === "fulfilled") {
        setLeaveData(requestsRes.value.data || []);
      }
      if (typesRes.status === "fulfilled") {
        setLeaveTypes(typesRes.value.data || []);
      }
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeName = (leaveTypeId) => {
    const typeObj = leaveTypes.find((t) => t.id === Number(leaveTypeId));
    if (typeObj) {
      return LEAVE_TYPE_LABEL_MAP[typeObj.name] || typeObj.name;
    }
    return `Leave #${leaveTypeId}`;
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await api.put(`admin_app/approve-leave/${id}/`);
      toast.success("Leave request approved successfully");
      setSelectedLeave(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to approve leave";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    try {
      setActionLoading(true);
      await api.put(`admin_app/reject-leave/${id}/`, { rejection_reason: rejectReason });
      toast.success("Leave request rejected");
      setSelectedLeave(null);
      setRejectReason("");
      setShowRejectInput(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to reject leave";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const counts = useMemo(() => {
    return {
      all: leaveData.length,
      pending: leaveData.filter((d) => (d.status || "").toLowerCase() === "pending").length,
      approved: leaveData.filter((d) => (d.status || "").toLowerCase() === "approved").length,
      rejected: leaveData.filter((d) => {
        const st = (d.status || "").toLowerCase();
        return st === "rejected" || st === "denied";
      }).length,
    };
  }, [leaveData]);

  const filteredData = useMemo(() => {
    return leaveData.filter((item) => {
      const itemStatus = (item.status || "").toLowerCase();
      const filterLower = activeFilter.toLowerCase();
      const filterMatch =
        filterLower === "all" ||
        itemStatus === filterLower ||
        (filterLower === "rejected" && itemStatus === "denied");

      const empName =
        item.user_name || item.employee_name || item.username || item.employee?.email || "";
      const reason = item.reason || "";
      const leaveTypeName = getLeaveTypeName(item.leave_type);

      const searchMatch =
        empName.toLowerCase().includes(search.toLowerCase()) ||
        reason.toLowerCase().includes(search.toLowerCase()) ||
        leaveTypeName.toLowerCase().includes(search.toLowerCase());

      return filterMatch && searchMatch;
    });
  }, [leaveData, activeFilter, search, leaveTypes]);

  const statusBadge = (statusStr) => {
    const status = (statusStr || "").toLowerCase();
    switch (status) {
      case "pending":
        return (
          <span className="all-leave-status pending">
            <FiClock size={12} />
            Pending
          </span>
        );

      case "approved":
        return (
          <span className="all-leave-status approved">
            <FiCheck size={12} />
            Approved
          </span>
        );

      case "rejected":
      case "denied":
        return (
          <span className="all-leave-status denied">
            <FiX size={12} />
            Rejected
          </span>
        );

      case "cancelled":
        return (
          <span className="all-leave-status cancelled" style={{ color: "#94a3b8", background: "#f1f5f9" }}>
            <FiX size={12} />
            Cancelled
          </span>
        );

      default:
        return <span style={{ textTransform: "capitalize" }}>{statusStr}</span>;
    }
  };

  if (loading) {
    return (
      <div className="all-leave-history-container">
        <p style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading leave requests...</p>
      </div>
    );
  }

  return (
    <div className="all-leave-history-container">
      {/* Top Bar */}
      <div className="all-leave-history-header">
        <div className="all-leave-filter-buttons">
          <button
            className={activeFilter === "All" ? "active" : ""}
            onClick={() => setActiveFilter("All")}
          >
            All ({counts.all})
          </button>

          <button
            className={activeFilter === "Pending" ? "pending-btn active" : "pending-btn"}
            onClick={() => setActiveFilter("Pending")}
          >
            Pending ({counts.pending})
          </button>

          <button
            className={activeFilter === "Approved" ? "approved-btn active" : "approved-btn"}
            onClick={() => setActiveFilter("Approved")}
          >
            Approved ({counts.approved})
          </button>

          <button
            className={activeFilter === "Rejected" ? "denied-btn active" : "denied-btn"}
            onClick={() => setActiveFilter("Rejected")}
          >
            Rejected ({counts.rejected})
          </button>
        </div>

        <div className="all-leave-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search employee or leave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="all-leave-table-wrapper">
        <table className="all-leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Dates</th>
              <th>Leave Type</th>
              <th>Days</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#94a3b8",
                  }}
                >
                  No Leave Requests Found
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const statusLower = (item.status || "").toLowerCase();
                const typeName = getLeaveTypeName(item.leave_type);
                const empDisplay =
                  item.user_name || item.employee_name || item.username || `Employee #${item.employee || item.id}`;

                return (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>{empDisplay}</span>
                    </td>

                    <td>
                      {item.start_date} to {item.end_date}
                    </td>

                    <td>{typeName}</td>

                    <td>{item.total_days || 1}d</td>

                    <td>{statusBadge(item.status)}</td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        {/* View Details Button */}
                        <button
                          className="all-leave-view-btn"
                          onClick={() => {
                            setSelectedLeave(item);
                            setShowRejectInput(false);
                            setRejectReason("");
                          }}
                          title="View Complete Details"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            width: "auto",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #bfdbfe",
                            cursor: "pointer",
                          }}
                        >
                          <FiEye size={14} />
                          <span>View</span>
                        </button>

                        {/* Quick Action Buttons for Pending */}
                        {statusLower === "pending" && (
                          <>
                            <button
                              className="action-btn approve"
                              onClick={() => handleApprove(item.id)}
                              title="Quick Approve"
                              style={{
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                borderRadius: "8px",
                                padding: "6px 8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <FiCheckCircle size={15} color="#16a34a" />
                            </button>
                            <button
                              className="action-btn reject"
                              onClick={() => {
                                setSelectedLeave(item);
                                setShowRejectInput(true);
                              }}
                              title="Reject Request"
                              style={{
                                background: "#fef2f2",
                                border: "1px solid #fecaca",
                                borderRadius: "8px",
                                padding: "6px 8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <FiXCircle size={15} color="#dc2626" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Leave Request Details Modal */}
      {selectedLeave && (
        <div
          className="leave-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedLeave(null)}
        >
          <div
            className="leave-modal-card animate-fade-in"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fafafa",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", color: "#0f172a", fontWeight: "700" }}>
                  Leave Request Details
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Request #{selectedLeave.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedLeave(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <FiX />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Employee & Status */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f8fafc",
                  padding: "12px 16px",
                  borderRadius: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "#8b5cf6",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                    }}
                  >
                    <FiUser />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "15px", color: "#1e293b" }}>
                      {selectedLeave.user_name || selectedLeave.employee_name || selectedLeave.username || "Employee"}
                    </h4>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {selectedLeave.employee_email || selectedLeave.email || ""}
                    </span>
                  </div>
                </div>
                <div>{statusBadge(selectedLeave.status)}</div>
              </div>

              {/* Grid Info */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
                    Leave Type
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", marginTop: "4px" }}>
                    {getLeaveTypeName(selectedLeave.leave_type)}
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
                    Duration
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#8b5cf6", marginTop: "4px" }}>
                    {selectedLeave.total_days || 1} Day(s)
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", gridColumn: "span 2" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
                    Dates
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiCalendar size={14} color="#8b5cf6" />
                    <span>{selectedLeave.start_date}</span>
                    <span style={{ color: "#94a3b8" }}>➔</span>
                    <span>{selectedLeave.end_date}</span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", marginBottom: "6px" }}>
                  Reason for Leave
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
                  {selectedLeave.reason || "No detailed reason provided."}
                </p>
              </div>

              {/* If already approved / rejected */}
              {selectedLeave.rejection_reason && (
                <div style={{ background: "#fef2f2", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fecaca" }}>
                  <div style={{ fontSize: "12px", color: "#dc2626", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiAlertCircle /> Rejection Reason:
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#991b1b" }}>
                    {selectedLeave.rejection_reason}
                  </p>
                </div>
              )}

              {/* Rejection input box if opened */}
              {showRejectInput && (selectedLeave.status || "").toLowerCase() === "pending" && (
                <div className="animate-fade-in" style={{ marginTop: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#dc2626", display: "block", marginBottom: "6px" }}>
                    Enter Reason for Rejection:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide a clear explanation for rejecting this request..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #fca5a5",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer / Actions */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                background: "#fafafa",
              }}
            >
              <button
                onClick={() => setSelectedLeave(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#64748b",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>

              {(selectedLeave.status || "").toLowerCase() === "pending" && (
                <>
                  {showRejectInput ? (
                    <button
                      onClick={() => handleReject(selectedLeave.id)}
                      disabled={actionLoading}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#dc2626",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FiXCircle />
                      <span>{actionLoading ? "Rejecting..." : "Confirm Rejection"}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowRejectInput(true)}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "8px",
                          border: "1px solid #fca5a5",
                          background: "#fef2f2",
                          color: "#dc2626",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <FiXCircle />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(selectedLeave.id)}
                        disabled={actionLoading}
                        style={{
                          padding: "8px 20px",
                          borderRadius: "8px",
                          border: "none",
                          background: "#16a34a",
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <FiCheckCircle />
                        <span>{actionLoading ? "Approving..." : "Approve Leave"}</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllLeaveHistory;