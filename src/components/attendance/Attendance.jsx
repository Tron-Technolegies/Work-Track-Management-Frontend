import React, { useState, useEffect } from "react";
import "./Attendance.css";
import api from "../../api/api";
import { toast } from "react-toastify";

// Sub-components
import AttendanceCard from "./AttendanceCard";
import AttendanceLeave from "./AttendanceLeave";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceLog from "./AttendanceLog";
import AttendanceCorrections from "./AttendanceCorrections";

const Attendance = () => {
  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'calendar' | 'logs' | 'corrections'
  const [loading, setLoading] = useState(false);

  // Role check
  const userRole = localStorage.getItem("user_role") || "";
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  // Data states
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [appliedBranch, setAppliedBranch] = useState("All Branches");
  const [statusFilter, setStatusFilter] = useState("All");

  const [summary, setSummary] = useState({
    present: 271,
    absent: 18,
    late: 14,
    on_leave: 18
  });
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [branches, setBranches] = useState(["All Branches"]);

  // Calendar tab states
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState({});
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(new Date().getDate());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeesList, setEmployeesList] = useState([]);

  // Corrections tab states
  const [corrections, setCorrections] = useState([]);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({
    work_date: "",
    check_in: "09:00",
    check_out: "18:00",
    reason: ""
  });

  // Fetch Attendance Data
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let url = `admin_app/attendance/?date=${date}`;
      if (appliedBranch !== "All Branches") {
        url += `&branch=${encodeURIComponent(appliedBranch)}`;
      }
      if (statusFilter !== "All") {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }

      const res = await api.get(url);
      if (res.data) {
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        if (res.data.logs) {
          setAttendanceLogs(res.data.logs);

          const uniqueBranches = Array.from(
            new Set(res.data.logs.map((l) => l.branch).filter(Boolean))
          );
          setBranches(["All Branches", ...uniqueBranches]);

          const emps = res.data.logs.map((l) => ({
            id: l.user_id,
            name: l.employee_name
          }));
          setEmployeesList(emps);
        }
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Calendar Data
  const fetchCalendar = async () => {
    try {
      let url = `admin_app/attendance/calendar/?month=${calendarMonth}&year=${calendarYear}`;
      if (selectedEmployeeId) {
        url += `&user_id=${selectedEmployeeId}`;
      }
      const res = await api.get(url);
      if (res.data && res.data.days) {
        setCalendarDays(res.data.days);
      }
    } catch (err) {
      console.error("Failed to fetch calendar data:", err);
    }
  };

  // Fetch Corrections Data
  const fetchCorrections = async () => {
    try {
      const res = await api.get("admin_app/attendance/corrections/");
      if (res.data) {
        setCorrections(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch corrections:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date, appliedBranch, statusFilter]);

  useEffect(() => {
    if (activeTab === "calendar") {
      fetchCalendar();
    } else if (activeTab === "corrections") {
      fetchCorrections();
    }
  }, [activeTab, calendarMonth, calendarYear, selectedEmployeeId]);

  const handleApplyFilters = () => {
    setAppliedBranch(selectedBranch);
  };

  // Export to CSV
  const handleExport = () => {
    if (!attendanceLogs.length) {
      toast.info("No attendance data to export");
      return;
    }
    const headers = ["Employee", "Branch", "Check In", "Check Out", "Duration", "Status", "Date"];
    const rows = attendanceLogs.map((l) => [
      `"${l.employee_name}"`,
      `"${l.branch}"`,
      `"${l.check_in}"`,
      `"${l.check_out}"`,
      `"${l.duration}"`,
      `"${l.status}"`,
      `"${l.work_date}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Live_Attendance_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Attendance report exported successfully!");
  };

  // Open Correction Modal
  const handleOpenCorrection = (row) => {
    setCorrectionTarget(row);
    setCorrectionForm({
      work_date: row ? row.work_date : date,
      check_in: row && row.check_in !== "-" ? row.check_in : "09:00",
      check_out: row && row.check_out !== "-" ? row.check_out : "18:00",
      reason: ""
    });
    setIsCorrectionModalOpen(true);
  };

  // Submit Correction Request
  const handleSubmitCorrection = async (e) => {
    e.preventDefault();
    if (!correctionForm.reason.trim()) {
      toast.error("Please provide a reason for the correction request");
      return;
    }

    try {
      const payload = {
        work_date: correctionForm.work_date,
        check_in: correctionForm.check_in,
        check_out: correctionForm.check_out,
        reason: correctionForm.reason
      };

      await api.post("admin_app/attendance/corrections/", payload);
      toast.success("Correction request submitted successfully!");
      setIsCorrectionModalOpen(false);
      if (activeTab === "corrections") {
        fetchCorrections();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to submit correction request");
    }
  };

  // Admin Action on Correction (Approve / Reject)
  const handleCorrectionAction = async (id, action) => {
    if (!isAdmin) {
      toast.error("You do not have permission to perform this action.");
      return;
    }

    try {
      let rejectionReason = "";
      if (action === "reject") {
        rejectionReason = window.prompt("Reason for rejection (optional):") || "";
      }

      const res = await api.post(`admin_app/attendance/corrections/${id}/action/`, {
        action,
        rejection_reason: rejectionReason
      });

      toast.success(res.data?.message || `Correction request ${action}d`);
      fetchCorrections();
      fetchAttendance();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || `Failed to ${action} correction`);
    }
  };

  const formatDisplayDate = (dStr) => {
    try {
      const [year, month, day] = dStr.split("-");
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="attendance-page-container">
      {/* Navigation Tabs */}
      <div className="att-tab-bar">
        <button
          className={`att-tab-btn ${activeTab === "live" ? "active" : ""}`}
          onClick={() => setActiveTab("live")}
        >
          Live
        </button>
        <button
          className={`att-tab-btn ${activeTab === "calendar" ? "active" : ""}`}
          onClick={() => setActiveTab("calendar")}
        >
          Calendar
        </button>
        <button
          className={`att-tab-btn ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          Logs
        </button>
        <button
          className={`att-tab-btn ${activeTab === "corrections" ? "active" : ""}`}
          onClick={() => setActiveTab("corrections")}
        >
          Corrections
        </button>
      </div>

      {/* Summary Stat Cards Component */}
      <AttendanceCard summary={summary} />

      {/* Main Panel with Sub-Components */}
      <div className="att-main-panel">
        {activeTab === "live" && (
          <AttendanceLeave
            date={date}
            attendanceLogs={attendanceLogs}
            onExport={handleExport}
            onOpenCorrection={handleOpenCorrection}
            formatDisplayDate={formatDisplayDate}
          />
        )}

        {activeTab === "calendar" && (
          <AttendanceCalendar
            calendarMonth={calendarMonth}
            calendarYear={calendarYear}
            calendarDays={calendarDays}
            selectedCalendarDay={selectedCalendarDay}
            setSelectedCalendarDay={setSelectedCalendarDay}
            isAdmin={isAdmin}
            selectedEmployeeId={selectedEmployeeId}
            setSelectedEmployeeId={setSelectedEmployeeId}
            employeesList={employeesList}
          />
        )}

        {activeTab === "logs" && (
          <AttendanceLog
            date={date}
            setDate={setDate}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            appliedBranch={appliedBranch}
            onApplyFilters={handleApplyFilters}
            branches={branches}
            attendanceLogs={attendanceLogs}
            formatDisplayDate={formatDisplayDate}
          />
        )}

        {activeTab === "corrections" && (
          <AttendanceCorrections
            corrections={corrections}
            isAdmin={isAdmin}
            onOpenCorrection={handleOpenCorrection}
            onCorrectionAction={handleCorrectionAction}
            isCorrectionModalOpen={isCorrectionModalOpen}
            setIsCorrectionModalOpen={setIsCorrectionModalOpen}
            correctionForm={correctionForm}
            setCorrectionForm={setCorrectionForm}
            onSubmitCorrection={handleSubmitCorrection}
          />
        )}
      </div>
    </div>
  );
};

export default Attendance;
