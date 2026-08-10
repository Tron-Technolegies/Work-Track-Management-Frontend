import React, { useEffect, useState } from "react";
import "./DetailedReports.css";
import api from "../../../api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function DetailedReports() {
  const [reportType, setReportType] = useState("projects"); // projects, attendance, idle, apps, websites
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("admin_app/users/");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("admin_app/projects/");
      setProjects(res.data.projects || res.data || []);
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedProject, selectedStatus, selectedUser, selectedDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedProject) params.append("project", selectedProject);
      if (selectedStatus) params.append("status", selectedStatus);
      if (selectedUser) params.append("user", selectedUser);
      if (selectedDate) params.append("date", selectedDate.toISOString().split("T")[0]);

      let endpoint = "admin_app/projects/summary/";
      if (reportType === "attendance") endpoint = "admin_app/attendance/";
      else if (reportType === "idle") endpoint = "admin_app/idle-report/";
      else if (reportType === "apps") endpoint = "admin_app/application-report/";
      else if (reportType === "websites") endpoint = "admin_app/website-report/";

      const res = await api.get(`${endpoint}?${params.toString()}`);
      setReportData(res.data.projects || res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load report", err);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedProject("");
    setSelectedUser("");
    setSelectedStatus("");
    setSelectedDate(null);
  };

  return (
    <>
      <div className="detailed-report-title">
        <div className="detailed-report-head" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span>Detailed Report</span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className={`detailed-report-btn ${reportType === "projects" ? "active" : ""}`}
              onClick={() => setReportType("projects")}
              style={{ background: reportType === "projects" ? "#8b5cf6" : "", color: reportType === "projects" ? "#fff" : "" }}
            >
              Projects
            </button>
            <button
              className={`detailed-report-btn ${reportType === "attendance" ? "active" : ""}`}
              onClick={() => setReportType("attendance")}
              style={{ background: reportType === "attendance" ? "#8b5cf6" : "", color: reportType === "attendance" ? "#fff" : "" }}
            >
              Attendance
            </button>
            <button
              className={`detailed-report-btn ${reportType === "idle" ? "active" : ""}`}
              onClick={() => setReportType("idle")}
              style={{ background: reportType === "idle" ? "#8b5cf6" : "", color: reportType === "idle" ? "#fff" : "" }}
            >
              Idle Time
            </button>
            <button
              className={`detailed-report-btn ${reportType === "apps" ? "active" : ""}`}
              onClick={() => setReportType("apps")}
              style={{ background: reportType === "apps" ? "#8b5cf6" : "", color: reportType === "apps" ? "#fff" : "" }}
            >
              Apps
            </button>
            <button
              className={`detailed-report-btn ${reportType === "websites" ? "active" : ""}`}
              onClick={() => setReportType("websites")}
              style={{ background: reportType === "websites" ? "#8b5cf6" : "", color: reportType === "websites" ? "#fff" : "" }}
            >
              Websites
            </button>
          </div>
        </div>

        <div className="report-details-box">
          {reportType === "projects" && (
            <select
              className="detailed-report-btn"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((project, index) => (
                <option key={project.id || index} value={project.project_name}>
                  {project.project_name}
                </option>
              ))}
            </select>
          )}

          <select
            className="detailed-report-btn"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">All Members</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name || user.username}
              </option>
            ))}
          </select>

          <DatePicker
            className="detailed-report-btn"
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            placeholderText="Select Date"
          />

          <button className="detailed-report-btn" onClick={handleResetFilters}>
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="detailed-report-table-wrapper">
        <table className="detailed-report-table">
          {reportType === "projects" && (
            <>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Task Count</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5">Loading...</td></tr>
                ) : reportData.length === 0 ? (
                  <tr><td colSpan="5">No Data Found</td></tr>
                ) : (
                  reportData.map((p, i) => (
                    <tr key={p.id || i}>
                      <td>{p.project_name}</td>
                      <td>{p.task_count || p.tasks_count || 0}</td>
                      <td>{p.due_date || p.deadline || "-"}</td>
                      <td>{p.status || "Pending"}</td>
                      <td>{p.completed || p.progress || 0}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </>
          )}

          {reportType === "attendance" && (
            <>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5">Loading...</td></tr>
                ) : reportData.length === 0 ? (
                  <tr><td colSpan="5">No Attendance Data Found</td></tr>
                ) : (
                  reportData.map((item, i) => (
                    <tr key={item.id || i}>
                      <td>{item.employee_name || item.user || "Employee"}</td>
                      <td>{item.work_date || item.date || "-"}</td>
                      <td>{item.clock_in ? new Date(item.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                      <td>{item.clock_out ? new Date(item.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                      <td>{item.total_work_time || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </>
          )}

          {reportType === "idle" && (
            <>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Idle Duration</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4">Loading...</td></tr>
                ) : reportData.length === 0 ? (
                  <tr><td colSpan="4">No Idle Time Data Found</td></tr>
                ) : (
                  reportData.map((item, i) => (
                    <tr key={item.id || i}>
                      <td>{item.employee_name || item.user || "Employee"}</td>
                      <td>{item.idle_start_time ? new Date(item.idle_start_time).toLocaleTimeString() : "-"}</td>
                      <td>{item.idle_end_time ? new Date(item.idle_end_time).toLocaleTimeString() : "Ongoing"}</td>
                      <td>{item.idle_duration || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </>
          )}

          {(reportType === "apps" || reportType === "websites") && (
            <>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Name / URL</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5">Loading...</td></tr>
                ) : reportData.length === 0 ? (
                  <tr><td colSpan="5">No Usage Log Found</td></tr>
                ) : (
                  reportData.map((item, i) => (
                    <tr key={item.id || i}>
                      <td>{item.employee_name || item.user || "Employee"}</td>
                      <td>{item.application_name || item.website_url || item.name || "-"}</td>
                      <td>{item.start_time ? new Date(item.start_time).toLocaleTimeString() : "-"}</td>
                      <td>{item.end_time ? new Date(item.end_time).toLocaleTimeString() : "Active"}</td>
                      <td>{item.duration || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </>
          )}
        </table>
      </div>
    </>
  );
}

export default DetailedReports;