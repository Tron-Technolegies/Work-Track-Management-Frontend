import React, { useEffect, useState } from "react";
import "./DashboardProjectDetails.css";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FiCalendar, FiChevronDown } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../../api/api";

const COLORS = ["#A91DDB", "#6B2E83", "#7B7B7B", "#C45BF5"];

function DashboardProjectDetails() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState("00h 00m");
  const [chartData, setChartData] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchProjectDetails(selectedDate);
  }, [selectedDate]);

  const fetchProjectDetails = async (date) => {
    try {
      setLoading(true);
      const formattedDate = date ? date.toISOString().split("T")[0] : "";
      const res = await api.get(`admin_app/dashboard/project-details/?date=${formattedDate}`);
      if (res.data) {
        setTotalTime(res.data.total_time || "00h 00m");
        const rawDist = res.data.status_distribution || [];
        const hasData = rawDist.some((d) => d.value > 0);
        if (hasData) {
          setChartData(rawDist);
        } else {
          setChartData([
            { name: "Completed", value: 0 },
            { name: "Working", value: 0 },
            { name: "Pending", value: 0 },
            { name: "Review", value: 0 },
          ]);
        }
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard project details", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (date) => {
    if (!date) return "Today";
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="project-details-card">
      <div className="project-details-header">
        <h3>Project Details</h3>

        <div className="project-details-date">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            customInput={
              <button className="project-date-btn">
                <FiCalendar size={18} />
                <span>{formatDisplayDate(selectedDate)}</span>
                <FiChevronDown size={16} />
              </button>
            }
          />
        </div>
      </div>

      <div className="project-details-body">
        {/* Left Chart */}
        <div className="project-chart-section">
          <div className="project-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={78}
                  outerRadius={110}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((item, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="project-chart-center">
              <span>Total</span>
              <h3>{totalTime}</h3>
            </div>
          </div>
        </div>

        {/* Right Table */}
        <div className="project-table">
          <div className="table-head">
            <span>User</span>
            <span>Task Spent</span>
          </div>

          {loading ? (
            <p style={{ padding: "20px", color: "#94a3b8" }}>Loading users...</p>
          ) : users.length === 0 ? (
            <p style={{ padding: "20px", color: "#94a3b8" }}>No employee task records</p>
          ) : (
            users.map((user) => (
              <div className="table-row" key={user.id}>
                <div className="table-user">
                  <img
                    src={user.image || "/user icon.svg"}
                    alt={user.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/user icon.svg";
                    }}
                  />
                  <p>{user.name}</p>
                </div>

                <span>{user.spent}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardProjectDetails;