import React, { useEffect, useState } from "react";
import "./RecentLeaveApplication.css";
import { FiCheck, FiClock, FiX } from "react-icons/fi";
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

function RecentLeaveApplication() {
  const [applications, setApplications] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const handleSubmitted = () => fetchData();
    window.addEventListener("leave-submitted", handleSubmitted);
    return () => window.removeEventListener("leave-submitted", handleSubmitted);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, typesRes] = await Promise.allSettled([
        api.get("user_app/my-leave-requests/"),
        api.get("admin_app/leave-types/"),
      ]);

      if (requestsRes.status === "fulfilled") {
        setApplications(requestsRes.value.data || []);
      }
      if (typesRes.status === "fulfilled") {
        setLeaveTypes(typesRes.value.data || []);
      }
    } catch (err) {
      console.error("Error fetching recent leave applications:", err);
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

  if (loading) {
    return <div className="recent-card"><p>Loading recent leaves...</p></div>;
  }

  if (applications.length === 0) {
    return (
      <div className="recent-card">
        <h3 className="recent-title">Recent Applications</h3>
        <p style={{ color: "#64748b", fontSize: "14px" }}>No leave applications submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="recent-card">
      <h3 className="recent-title">Recent Applications</h3>

      {applications.slice(0, 3).map((item, index) => {
        const statusLower = (item.status || "").toLowerCase();
        const isApproved = statusLower === "approved";
        const isRejected = statusLower === "rejected";
        const isPending = statusLower === "pending";

        const typeName = getLeaveTypeName(item.leave_type);

        return (
          <React.Fragment key={item.id || index}>
            <div className="application-item">
              <div className="application-info">
                <h4>{typeName}</h4>
                <span>{item.start_date} to {item.end_date}</span>
              </div>

              <div className={`status ${isApproved ? "approved" : isRejected ? "rejected" : "pending"}`}>
                {isApproved && <FiCheck />}
                {isRejected && <FiX />}
                {isPending && <FiClock />}
                <span style={{ textTransform: "capitalize" }}>{item.status}</span>
              </div>
            </div>

            {index !== Math.min(applications.length, 3) - 1 && (
              <div className="divider"></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default RecentLeaveApplication;