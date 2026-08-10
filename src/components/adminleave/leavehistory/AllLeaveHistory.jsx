import React, { useEffect, useState, useMemo } from "react";
import "./AllLeaveHistory.css";
import {
  FiSearch,
  FiClock,
  FiCheck,
  FiX,
  FiCheckCircle,
  FiXCircle,
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
      // Backend expects PUT for admin_app/approve-leave/<pk>/
      await api.put(`admin_app/approve-leave/${id}/`);
      toast.success("Leave request approved successfully");
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to approve leave";
      toast.error(msg);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    try {
      // Backend expects PUT for admin_app/reject-leave/<pk>/
      await api.put(`admin_app/reject-leave/${id}/`, { rejection_reason: reason || "" });
      toast.success("Leave request rejected");
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to reject leave";
      toast.error(msg);
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
        <p>Loading leave requests...</p>
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
            className={activeFilter === "Pending" ? "pending-btn" : ""}
            onClick={() => setActiveFilter("Pending")}
          >
            Pending ({counts.pending})
          </button>

          <button
            className={activeFilter === "Approved" ? "approved-btn" : ""}
            onClick={() => setActiveFilter("Approved")}
          >
            Approved ({counts.approved})
          </button>

          <button
            className={activeFilter === "Rejected" ? "denied-btn" : ""}
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
              <th>Action</th>
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
                      <span>{empDisplay}</span>
                    </td>

                    <td>
                      {item.start_date} to {item.end_date}
                    </td>

                    <td>{typeName}</td>

                    <td>{item.total_days || 1}d</td>

                    <td>{statusBadge(item.status)}</td>

                    <td>
                      {statusLower === "pending" ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="action-btn approve"
                            onClick={() => handleApprove(item.id)}
                            title="Approve"
                          >
                            <FiCheckCircle size={16} color="#16a34a" />
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={() => handleReject(item.id)}
                            title="Reject"
                          >
                            <FiXCircle size={16} color="#dc2626" />
                          </button>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllLeaveHistory;