import React, { useEffect, useRef, useState } from "react";
import "./TaskTimeSheet.css";
import { FaDownload, FaFilePdf, FaFileExcel, FaChevronDown } from "react-icons/fa";
import DateRangePicker from "./DateRangePicker";
import api from "../../../api/api";

// ── Lazy-load heavy export libs so they don't bloat the initial bundle ────────
async function exportToPDF(tasks, formatDate) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(47, 52, 66);
  doc.text("Task Time Sheet", 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [["Task", "Project", "Due Date", "Status", "Spent / Est", "Assigned To"]],
    body: tasks.map((item) => [
      item.task_name || "",
      item.project?.project_name || item.project_name || "N/A",
      formatDate(item.due_date),
      item.status || "Pending",
      `${item.time_spent || "00h 00m"} / ${item.working_hours || 0}h`,
      Array.isArray(item.assigned_to) && item.assigned_to.length > 0
        ? item.assigned_to
            .map((u) => (typeof u === "object" ? u.first_name || u.username : u))
            .join(", ")
        : "Unassigned",
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 5,
      font: "helvetica",
      textColor: [17, 17, 17],
      lineColor: [235, 229, 255],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [248, 238, 252],
      textColor: [59, 66, 85],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [250, 246, 255] },
    columnStyles: {
      0: { cellWidth: 55 },
      4: { halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  doc.save("task_timesheet.pdf");
}

async function exportToExcel(tasks, formatDate) {
  const XLSX = await import("xlsx");

  const rows = tasks.map((item) => ({
    Task: item.task_name || "",
    Project: item.project?.project_name || item.project_name || "N/A",
    "Due Date": formatDate(item.due_date),
    Status: item.status || "Pending",
    "Time Spent": item.time_spent || "00h 00m",
    "Estimated (hrs)": item.working_hours || 0,
    "Assigned To":
      Array.isArray(item.assigned_to) && item.assigned_to.length > 0
        ? item.assigned_to
            .map((u) => (typeof u === "object" ? u.first_name || u.username : u))
            .join(", ")
        : "Unassigned",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((r) => String(r[key] ?? "").length)
    ) + 2,
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Task TimeSheet");
  XLSX.writeFile(wb, "task_timesheet.xlsx");
}

// ─────────────────────────────────────────────────────────────────────────────

function TaskTimeSheet() {
  const userRole = (localStorage.getItem("user_role") || "user").toLowerCase();
  const isAdminOrLead = userRole === "admin" || userRole === "super_admin" || userRole === "project_lead";

  const [tasks, setTasks] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(null); // "pdf" | "excel" | null
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchTimeSheetTasks();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTimeSheetTasks = async () => {
    try {
      const res = await api.get("admin_app/tasks/");
      const list = Array.isArray(res.data?.tasks) ? res.data.tasks : [];
      setTasks(list);
    } catch (err) {
      console.error("Error fetching timesheet tasks:", err.response?.data || err);
      setTasks([]);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return dateStr.slice(0, 10);
  };

  const handleExport = async (type) => {
    if (tasks.length === 0) return;
    setExporting(type);
    setExportOpen(false);
    try {
      if (type === "pdf") {
        await exportToPDF(tasks, formatDate);
      } else {
        await exportToExcel(tasks, formatDate);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="timesheet-card">
      {/* Header */}
      <div className="timesheet-header">
        <h2>Task Time Sheet</h2>

        <div className="header-actions">
          {/* ── Export Dropdown ── */}
          {isAdminOrLead && (
            <div className="export-dropdown" ref={dropdownRef}>
              <button
                className={`export-btn ${exportOpen ? "export-btn--open" : ""}`}
                onClick={() => setExportOpen((prev) => !prev)}
                disabled={!!exporting}
                aria-haspopup="true"
                aria-expanded={exportOpen}
              >
                {exporting ? (
                  <>
                    <span className="export-spinner" />
                    Exporting…
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Export
                    <FaChevronDown className="export-chevron" />
                  </>
                )}
              </button>

              {exportOpen && (
                <div className="export-menu" role="menu">
                  <button
                    className="export-menu-item"
                    onClick={() => handleExport("pdf")}
                    role="menuitem"
                  >
                    <span className="export-menu-icon pdf-icon">
                      <FaFilePdf />
                    </span>
                    <span>
                      <strong>PDF</strong>
                      <em>Portrait table layout</em>
                    </span>
                  </button>

                  <button
                    className="export-menu-item"
                    onClick={() => handleExport("excel")}
                    role="menuitem"
                  >
                    <span className="export-menu-icon excel-icon">
                      <FaFileExcel />
                    </span>
                    <span>
                      <strong>Excel</strong>
                      <em>.xlsx spreadsheet</em>
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          <DateRangePicker />
        </div>
      </div>

      {/* Table — wrapped for responsive horizontal scroll */}
      <div className="timesheet-table-wrapper">
        <table className="timesheet-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Spent / Est</th>
              <th>Assigned To</th>
            </tr>
          </thead>

          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                  No task timesheet records found
                </td>
              </tr>
            ) : (
              tasks.map((item) => (
                <tr key={item.id}>
                  <td>{item.task_name}</td>
                  <td>{item.project?.project_name || item.project_name || "N/A"}</td>
                  <td>{formatDate(item.due_date)}</td>
                  <td>{item.status || "Pending"}</td>
                  <td>
                    {item.time_spent || "00h 00m"}
                    {" / "}
                    {item.working_hours || 0}h
                  </td>
                  <td>
                    {Array.isArray(item.assigned_to) && item.assigned_to.length > 0
                      ? item.assigned_to
                          .map((u) => (typeof u === "object" ? u.first_name || u.username : u))
                          .join(", ")
                      : "Unassigned"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskTimeSheet;