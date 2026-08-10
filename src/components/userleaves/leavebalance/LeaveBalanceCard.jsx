import React, { useState, useEffect } from "react";
import "./LeaveBalanceCard.css";
import { FaCalendarAlt, FaBriefcase, FaBaby, FaBolt } from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import api from "../../../api/api";

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

const COLOR_MAP = ["purple", "blue", "orange", "green", "pink", "red"];

const ICON_MAP = {
  sick: <MdMedicalServices />,
  work_from_home: <FaBriefcase />,
  maternity: <FaBaby />,
  paternity: <FaBaby />,
  casual: <FaCalendarAlt />,
  earned: <FaCalendarAlt />,
};

function LeaveBalanceCard() {
  const [view, setView] = useState("monthly");
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Error fetching leave balance card data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-leave-balance-page" style={{ padding: "30px", textAlign: "center" }}>
        <p>Loading leave balance data...</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="my-leave-balance-page">
      <div className="my-leave-toggle">
        <button
          className={view === "monthly" ? "active" : ""}
          onClick={() => setView("monthly")}
        >
          Monthly
        </button>

        <button
          className={view === "yearly" ? "active" : ""}
          onClick={() => setView("yearly")}
        >
          Yearly
        </button>
      </div>

      <div className="my-leave-grid">
        {leaveTypes.length === 0 ? (
          <p style={{ color: "#94a3b8", padding: "20px" }}>No leave types configured.</p>
        ) : (
          leaveTypes.map((type, idx) => {
            const label = LEAVE_TYPE_LABEL_MAP[type.name] || type.name;
            const total = type.days_per_year || 12;
            const color = COLOR_MAP[idx % COLOR_MAP.length];
            const icon = ICON_MAP[type.name] || <FaCalendarAlt />;

            // Sum approved days for this leave type
            const used = userRequests
              .filter(
                (r) =>
                  Number(r.leave_type) === Number(type.id) &&
                  (r.status || "").toLowerCase() === "approved"
              )
              .reduce((sum, r) => sum + (r.total_days || 0), 0);

            const left = Math.max(0, total - used);
            const progress = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

            return (
              <div className="my-leave-card" key={type.id || idx}>
                <div className="my-leave-header">
                  <div className={`my-leave-icon ${color}`}>{icon}</div>

                  <div>
                    <h4>{label}</h4>
                    <p>FY {currentYear}</p>
                  </div>
                </div>

                <div className="my-leave-stats">
                  <div className="my-stat-box">
                    <h3>{total}</h3>
                    <span>Total</span>
                  </div>

                  <div className="my-stat-box">
                    <h3>{used}</h3>
                    <span>Used</span>
                  </div>

                  <div className="my-stat-box">
                    <h3>{left}</h3>
                    <span>Left</span>
                  </div>
                </div>

                <div className="my-leave-progress">
                  <div
                    className={`my-leave-progress-fill ${color}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="my-leave-progress-footer">
                  <span>Used</span>
                  <span>{progress}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LeaveBalanceCard;