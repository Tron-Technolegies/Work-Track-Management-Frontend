import React, { useEffect, useState } from "react";
import "./MyLeaveHistory.css";
import { FiClock, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import api from "../../../../api/api";
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

function MyLeaveHistory() {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [historyRes, typesRes] = await Promise.allSettled([
        api.get("user_app/my-leave-requests/"),
        api.get("admin_app/leave-types/"),
      ]);

      if (historyRes.status === "fulfilled") {
        setLeaveHistory(historyRes.value.data || []);
      }
      if (typesRes.status === "fulfilled") {
        setLeaveTypes(typesRes.value.data || []);
      }
    } catch (err) {
      console.error("Error fetching leave history:", err);
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

  const handleCancelLeave = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      // Backend expects PUT for user_app/cancel-leave/<pk>/
      await api.put(`user_app/cancel-leave/${id}/`);
      toast.success("Leave request cancelled successfully");
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to cancel leave request";
      toast.error(msg);
    }
  };

  if (loading) {
    return <div className="leave-history-card"><p>Loading leave history...</p></div>;
  }

  if (leaveHistory.length === 0) {
    return (
      <div className="leave-history-card">
        <h3 className="leave-history-title">Leave History</h3>
        <p style={{ color: "#64748b", padding: "16px 0" }}>No leave requests found.</p>
      </div>
    );
  }

  return (
    <div className="leave-history-card">
      <h3 className="leave-history-title">Leave History</h3>

      {leaveHistory.map((leave) => {
        const statusLower = (leave.status || "").toLowerCase();
        const isApproved = statusLower === "approved";
        const isRejected = statusLower === "rejected";
        const isPending = statusLower === "pending";
        const isCancelled = statusLower === "cancelled";

        const typeName = getLeaveTypeName(leave.leave_type);

        return (
          <div className="history-row" key={leave.id}>
            <div className="history-type">
              <span className="leave-dot"></span>
              {typeName}
            </div>

            <div className="history-date">
              <span>{leave.start_date}</span>
              <span>→</span>
              <span>{leave.end_date}</span>
            </div>

            <div className="history-days">
              {leave.total_days || 1} day(s)
            </div>

            <div className="history-applied">
              {leave.created_at ? new Date(leave.created_at).toLocaleDateString() : "-"}
            </div>

            <div className="history-reason">
              {leave.reason}
            </div>

            <div
              className={`history-status ${
                isApproved
                  ? "approved"
                  : isRejected
                  ? "rejected"
                  : isCancelled
                  ? "cancelled"
                  : "pending"
              }`}
            >
              {isApproved && <FiCheck />}
              {isRejected && <FiX />}
              {isPending && <FiClock />}
              <span style={{ textTransform: "capitalize" }}>{leave.status}</span>
            </div>

            {isPending && (
              <button
                className="cancel-leave-btn"
                onClick={() => handleCancelLeave(leave.id)}
                title="Cancel Request"
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  marginLeft: "8px",
                }}
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MyLeaveHistory;