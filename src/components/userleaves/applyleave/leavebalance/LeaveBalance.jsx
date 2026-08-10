import React, { useEffect, useState } from "react";
import "./LeaveBalance.css";
import api from "../../../../api/api";

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

function LeaveBalance() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = ["#7C3AED", "#0EA5E9", "#D97706", "#10B981", "#EC4899", "#F43F5E"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesRes, requestsRes] = await Promise.allSettled([
        api.get("admin_app/leave-types/"),
        api.get("user_app/my-leave-requests/"),
      ]);

      if (typesRes.status === "fulfilled") {
        setLeaveTypes(typesRes.value.data || []);
      }
      if (requestsRes.status === "fulfilled") {
        setUserRequests(requestsRes.value.data || []);
      }
    } catch (err) {
      console.error("Error fetching leave balance data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="leave-balance-card"><p>Loading leave balance...</p></div>;
  }

  return (
    <div className="leave-balance-card">
      <h3 className="balance-title">Leave Balance</h3>

      {leaveTypes.map((leave, index) => {
        const label = LEAVE_TYPE_LABEL_MAP[leave.name] || leave.name;
        const total = leave.days_per_year || 12;
        const color = colors[index % colors.length];

        // Sum approved days for this leave_type
        const used = userRequests
          .filter(
            (r) =>
              Number(r.leave_type) === Number(leave.id) &&
              (r.status || "").toLowerCase() === "approved"
          )
          .reduce((sum, r) => sum + (r.total_days || 0), 0);

        const left = Math.max(0, total - used);
        const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

        return (
          <div className="leave-item" key={leave.id || index}>
            <div className="leave-balance-item-header">
              <div className="leave-name">{label}</div>

              <div className="leave-count">
                <strong>{left}</strong> / {total} days left
              </div>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${percent}%`,
                  background: color,
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LeaveBalance;
