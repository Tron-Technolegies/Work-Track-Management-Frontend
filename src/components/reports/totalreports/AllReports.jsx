import React, { useState, useEffect } from "react";
import "./AllReports.css";
import AllReportsCards from "./AllReportsCards";
import api from "../../../api/api";
import { toast } from "react-toastify";
import { FiSearch, FiDownload, FiCalendar } from "react-icons/fi";

const AllReports = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
    
  });

  // Monthly / yearly pickers
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedYear, setSelectedYear] = useState(() =>
    String(new Date().getFullYear())
  );
  const [exportingMonthlyExcel, setExportingMonthlyExcel] = useState(false);
  const [exportingMonthlyPdf, setExportingMonthlyPdf] = useState(false);
  const [exportingYearlyExcel, setExportingYearlyExcel] = useState(false);
  const [exportingYearlyPdf, setExportingYearlyPdf] = useState(false);

  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [reportsData, setReportsData] = useState([]);

  // Build year options (current year ± 5)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // ─── Load filter options ────────────────────────────────────────────────────
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [teamsRes, usersRes] = await Promise.allSettled([
        api.get("admin_app/view-teams/"),
        api.get("admin_app/users/")
      ]);

      if (teamsRes.status === "fulfilled" && teamsRes.value.data) {
        const rawTeams = teamsRes.value.data;
        const teamList = Array.isArray(rawTeams)
          ? rawTeams
          : Array.isArray(rawTeams.data)
          ? rawTeams.data
          : Array.isArray(rawTeams.teams)
          ? rawTeams.teams
          : [];
        setTeams(teamList);
      }
      if (usersRes.status === "fulfilled" && usersRes.value.data) {
        const rawUsers = usersRes.value.data;
        const userList = Array.isArray(rawUsers)
          ? rawUsers
          : Array.isArray(rawUsers.data)
          ? rawUsers.data
          : Array.isArray(rawUsers.users)
          ? rawUsers.users
          : [];
        setUsers(userList);
      }
    } catch (err) {
      console.error("Failed to load filter options:", err);
    }
  };

  // ─── Daily report fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchAllReports();
  }, [selectedDate, selectedTeam, selectedUser, searchQuery]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedTeam && selectedTeam !== "All Teams") params.append("team", selectedTeam);
      if (selectedUser && selectedUser !== "All Users") params.append("user", selectedUser);
      if (searchQuery) params.append("search", searchQuery);

      const res = await api.get(`admin_app/reports/all/?${params.toString()}`);
      if (res.data) {
        if (res.data.summary) setSummary(res.data.summary);
        if (res.data.reports) setReportsData(res.data.reports);
      }
    } catch (err) {
      console.error("Failed to fetch all reports:", err);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared filter params builder ────────────────────────────────────────────
  const buildFilterParams = () => {
    const params = new URLSearchParams();
    if (selectedTeam && selectedTeam !== "All Teams") params.append("team", selectedTeam);
    if (selectedUser && selectedUser !== "All Users") params.append("user", selectedUser);
    if (searchQuery) params.append("search", searchQuery);
    return params;
  };

  // ─── Generic file download helper ───────────────────────────────────────────
  const downloadFile = async (url, filename, loadingSetter) => {
    try {
      if (loadingSetter) loadingSetter(true);
      const res = await api.get(url, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`${filename} downloaded!`);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download report");
    } finally {
      if (loadingSetter) loadingSetter(false);
    }
  };

  // ─── Daily export handlers ───────────────────────────────────────────────────
  const handleExportExcel = async () => {
    const params = buildFilterParams();
    if (selectedDate) params.append("date", selectedDate);
    await downloadFile(
      `admin_app/export/reports/excel/?${params.toString()}`,
      `Daily_Report_${selectedDate}.xlsx`,
      null
    );
  };

  const handleExportPDF = async () => {
    const params = buildFilterParams();
    if (selectedDate) params.append("date", selectedDate);
    await downloadFile(
      `admin_app/export/reports/pdf/?${params.toString()}`,
      `Daily_Report_${selectedDate}.pdf`,
      null
    );
  };

  // ─── Monthly export handlers ─────────────────────────────────────────────────
  const handleMonthlyExcel = async () => {
    const params = buildFilterParams();
    params.append("month", selectedMonth);
    await downloadFile(
      `admin_app/export/reports/monthly/excel/?${params.toString()}`,
      `Monthly_Report_${selectedMonth}.xlsx`,
      setExportingMonthlyExcel
    );
  };

  const handleMonthlyPDF = async () => {
    const params = buildFilterParams();
    params.append("month", selectedMonth);
    await downloadFile(
      `admin_app/export/reports/monthly/pdf/?${params.toString()}`,
      `Monthly_Report_${selectedMonth}.pdf`,
      setExportingMonthlyPdf
    );
  };

  // ─── Yearly export handlers ──────────────────────────────────────────────────
  const handleYearlyExcel = async () => {
    const params = buildFilterParams();
    params.append("year", selectedYear);
    await downloadFile(
      `admin_app/export/reports/yearly/excel/?${params.toString()}`,
      `Yearly_Report_${selectedYear}.xlsx`,
      setExportingYearlyExcel
    );
  };

  const handleYearlyPDF = async () => {
    const params = buildFilterParams();
    params.append("year", selectedYear);
    await downloadFile(
      `admin_app/export/reports/yearly/pdf/?${params.toString()}`,
      `Yearly_Report_${selectedYear}.pdf`,
      setExportingYearlyPdf
    );
  };

  return (
    <div className="all-reports-container">

      {/* ── Top filter bar (Daily) ── */}
      <div className="all-rep-filter-card">
        <div className="all-rep-search-box">
          <FiSearch className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search......"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="all-rep-select"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          <option value="All Teams">Team</option>
          {Array.isArray(teams) &&
            teams.map((t) => (
              <option key={t.id || t.team_name} value={t.id || t.team_name}>
                {t.team_name || t}
              </option>
            ))}
        </select>

        <select
          className="all-rep-select"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="All Users">User</option>
          {Array.isArray(users) &&
            users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name ? `${u.first_name} ${u.last_name}` : u.username || u.email}
              </option>
            ))}
        </select>

        <div className="all-rep-date-picker">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <FiCalendar className="date-icon" size={16} />
        </div>

        <div className="all-rep-buttons">
          <button className="btn-excel" onClick={handleExportExcel}>
            Excel <FiDownload size={15} />
          </button>
          <button className="btn-export-pdf" onClick={handleExportPDF}>
            Export <FiDownload size={15} />
          </button>
        </div>
      </div>

      {/* ── Monthly & Yearly export bar ── */}
      <div className="all-rep-period-bar">

        {/* Monthly */}
        <div className="period-section">
          <span className="period-label">Monthly Report</span>
          <div className="period-controls">
            <div className="all-rep-date-picker">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              <FiCalendar className="date-icon" size={14} />
            </div>
            <button
              className="btn-period-excel"
              onClick={handleMonthlyExcel}
              disabled={exportingMonthlyExcel}
            >
              {exportingMonthlyExcel ? "..." : "Excel"} <FiDownload size={14} />
            </button>
            <button
              className="btn-period-pdf"
              onClick={handleMonthlyPDF}
              disabled={exportingMonthlyPdf}
            >
              {exportingMonthlyPdf ? "..." : "PDF"} <FiDownload size={14} />
            </button>
          </div>
        </div>

        <div className="period-divider" />

        {/* Yearly */}
        <div className="period-section">
          <span className="period-label">Yearly Report</span>
          <div className="period-controls">
            <select
              className="all-rep-select year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
            <button
              className="btn-period-excel"
              onClick={handleYearlyExcel}
              disabled={exportingYearlyExcel}
            >
              {exportingYearlyExcel ? "..." : "Excel"} <FiDownload size={14} />
            </button>
            <button
              className="btn-period-pdf"
              onClick={handleYearlyPDF}
              disabled={exportingYearlyPdf}
            >
              {exportingYearlyPdf ? "..." : "PDF"} <FiDownload size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 5 Summary Cards ── */}
      <AllReportsCards summary={summary} />

      {/* ── Daily data table ── */}
      <div className="all-rep-table-card">
        {loading && (
          <div className="table-loading">Loading report data...</div>
        )}
        <div className="all-rep-table-wrapper">
          <table className="all-rep-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Break In</th>
                <th>Break Out</th>
                <th>Total Break</th>
                <th>Task Time</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {reportsData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-row">
                    No report data found for the selected filters
                  </td>
                </tr>
              ) : (
                reportsData.map((row) => (
                  <tr key={row.id}>
                    <td className="emp-name">{row.employee_name}</td>
                    <td>{row.date}</td>
                    <td>{row.clock_in}</td>
                    <td>{row.clock_out}</td>
                    <td>{row.break_in}</td>
                    <td>{row.break_out}</td>
                    <td>{row.total_break}</td>
                    <td>{row.task_time}</td>
                    <td className="total-hours">{row.total_hours}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllReports;
