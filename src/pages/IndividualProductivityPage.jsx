import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Employeeproductivity from "../components/productivity/employeeproductivity/EmployeeProductivity";
import RecentTasks from "../components/productivity/recenttasks/RecentTasks";
import ProductivityPieChart from "../components/productivity/productivitypiechart/ProductivityPieChart";
import "./IndividualProductivityPage.css";
import { toast } from "react-toastify";
import { FiClock, FiActivity, FiImage, FiGrid, FiCoffee } from "react-icons/fi";

function IndividualProductivityPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, clock, apps, idle, screenshots
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchEmployeeProductivity(id);
  }, [id]);

  const fetchEmployeeProductivity = async (userId) => {
    try {
      setLoading(true);
      const res = await api.get(`admin_app/employees/${userId}/productivity/`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch employee productivity:", err);
      toast.error("Failed to load individual productivity details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="individual-productivity-page" style={{ padding: "40px" }}>
        <p>Loading employee tracking report...</p>
      </div>
    );
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="individual-productivity-page">
      <Employeeproductivity user={data?.user} />

      {/* Tabs Navigation */}
      <div className="tracking-tabs-header">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <FiGrid /> Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "clock" ? "active" : ""}`}
          onClick={() => setActiveTab("clock")}
        >
          <FiClock /> Clock Sessions
        </button>
        <button
          className={`tab-btn ${activeTab === "apps" ? "active" : ""}`}
          onClick={() => setActiveTab("apps")}
        >
          <FiActivity /> Apps & Web
        </button>
        <button
          className={`tab-btn ${activeTab === "idle" ? "active" : ""}`}
          onClick={() => setActiveTab("idle")}
        >
          <FiCoffee /> Idle & Breaks
        </button>
        <button
          className={`tab-btn ${activeTab === "screenshots" ? "active" : ""}`}
          onClick={() => setActiveTab("screenshots")}
        >
          <FiImage /> Screenshots
        </button>
      </div>

      {/* Tab Contents */}
      <div className="tracking-tab-content">
        {activeTab === "overview" && (
          <div className="individual-productivity-bottom">
            <RecentTasks tasks={data?.user?.recent_tasks || data?.tasks || []} />
            <ProductivityPieChart productivity={data?.productivity} />
          </div>
        )}

        {activeTab === "clock" && (
          <div className="tracking-card-container animate-fade-in">
            <h3>Clock In & Out Logs</h3>
            <table className="tracking-table-style">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Worked Time</th>
                </tr>
              </thead>
              <tbody>
                {!data?.attendance?.length ? (
                  <tr>
                    <td colSpan="4" className="empty-msg">No session records logged today</td>
                  </tr>
                ) : (
                  data.attendance.map((att) => (
                    <tr key={att.id}>
                      <td>{att.work_date}</td>
                      <td>{formatTime(att.clock_in)}</td>
                      <td>{att.clock_out ? formatTime(att.clock_out) : "Active Now"}</td>
                      <td style={{ fontWeight: "600", color: "#8b5cf6" }}>{att.total_work_time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "apps" && (
          <div className="tracking-dual-grid animate-fade-in">
            {/* Apps usage */}
            <div className="tracking-card-container">
              <h3>Application Usage Log</h3>
              <table className="tracking-table-style">
                <thead>
                  <tr>
                    <th>App Name</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {!data?.applications?.length ? (
                    <tr>
                      <td colSpan="4" className="empty-msg">No apps tracked today</td>
                    </tr>
                  ) : (
                    data.applications.map((app) => (
                      <tr key={app.id}>
                        <td>{app.name}</td>
                        <td>{formatTime(app.start_time)}</td>
                        <td>{app.end_time ? formatTime(app.end_time) : "Active"}</td>
                        <td>{app.duration}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Websites usage */}
            <div className="tracking-card-container">
              <h3>Website Browsing Log</h3>
              <table className="tracking-table-style">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {!data?.websites?.length ? (
                    <tr>
                      <td colSpan="4" className="empty-msg">No website usage tracked today</td>
                    </tr>
                  ) : (
                    data.websites.map((web) => (
                      <tr key={web.id}>
                        <td className="url-cell" title={web.url}>
                          {web.url}
                        </td>
                        <td>{formatTime(web.start_time)}</td>
                        <td>{web.end_time ? formatTime(web.end_time) : "Active"}</td>
                        <td>{web.duration}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "idle" && (
          <div className="tracking-card-container animate-fade-in">
            <h3>Idle & Break Session Log</h3>
            <table className="tracking-table-style">
              <thead>
                <tr>
                  <th>Idle Started</th>
                  <th>Idle Ended</th>
                  <th>Idle Duration</th>
                </tr>
              </thead>
              <tbody>
                {!data?.idle_sessions?.length ? (
                  <tr>
                    <td colSpan="3" className="empty-msg">No idle/break sessions recorded today</td>
                  </tr>
                ) : (
                  data.idle_sessions.map((idle) => (
                    <tr key={idle.id}>
                      <td>{formatTime(idle.start_time)}</td>
                      <td>{idle.end_time ? formatTime(idle.end_time) : "Active"}</td>
                      <td style={{ color: "#f59e0b", fontWeight: "600" }}>{idle.duration}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "screenshots" && (
          <div className="tracking-card-container animate-fade-in">
            <h3>Desktop Screenshot Log</h3>
            {!data?.screenshots?.length ? (
              <p className="empty-msg">No screenshot records captured today</p>
            ) : (
              <div className="screenshot-gallery-grid">
                {data.screenshots.map((s) => (
                  <div
                    className="screenshot-gallery-card"
                    key={s.id}
                    onClick={() => setSelectedScreenshot(s)}
                  >
                    <div className="screenshot-thumbnail-wrapper">
                      {s.image ? (
                        <img src={s.image} alt="Employee Screen" />
                      ) : (
                        <div className="screenshot-no-image">No Image Captured</div>
                      )}
                    </div>
                    <div className="screenshot-meta-footer">
                      <span>{formatTime(s.captured_at)}</span>
                      {s.reason && <span className="reason-badge">{s.reason}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Screenshot full view lightbox */}
      {selectedScreenshot && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 999999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "80%",
              background: "#1e293b",
              padding: "10px",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedScreenshot.image}
              alt="Screenshot Preview"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                display: "block",
                borderRadius: "8px",
              }}
            />
            <div style={{ marginTop: "12px", color: "#fff", display: "flex", justifyContent: "space-between" }}>
              <span>Captured at: {new Date(selectedScreenshot.captured_at).toLocaleString()}</span>
              {selectedScreenshot.reason && (
                <span style={{ background: "#ef4444", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>
                  {selectedScreenshot.reason}
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedScreenshot(null)}
              style={{
                position: "absolute",
                top: "-15px",
                right: "-15px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndividualProductivityPage;