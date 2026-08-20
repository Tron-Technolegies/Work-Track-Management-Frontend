import React, { useEffect, useState } from "react";
import "./EmployeeProductivity.css";
import api from "../../../api/api";
import UserAvatar from "../../common/UserAvatar";
import { FiDownload, FiFileText, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const Employeeproductivity = ({ user }) => {
  const userRole = (localStorage.getItem("user_role") || "user").toLowerCase();
  const isAdminOrLead = userRole === "admin" || userRole === "super_admin" || userRole === "project_lead";

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState("");
  const [exportEmployee, setExportEmployee] = useState(null);
  const [exportPeriod, setExportPeriod] = useState("daily");
  const [exportFormat, setExportFormat] = useState("excel");
  const [exportDate, setExportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!exportEmployee) return;

    try {
      setExporting(true);

      const response = await api.get(
        `admin_app/employees/productivity/${exportEmployee.id}/export/`,
        {
          params: {
            period: exportPeriod,
            date: exportDate,
            format: exportFormat,
            export_format: exportFormat,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            exportFormat === "excel"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : "application/pdf",
        }
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const employeeName =
        exportEmployee.name || "employee";

      const safeName = employeeName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );

      link.download =
        `${safeName}_productivity_${exportPeriod}.${exportFormat === "excel" ? "xlsx" : "pdf"}`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Productivity report downloaded successfully!");
      setExportEmployee(null);

    } catch (error) {
      console.error(
        "Productivity export error:",
        error
      );

      let errorMsg = "Failed to export productivity report.";

      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          errorMsg = errorData.detail || errorData.error || errorMsg;
        } catch {
          // fallback default
        }
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }

      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (user) {
      setEmployees([user]);
      setLoading(false);
    } else {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "admin_app/employees/productivity/"
      );

      console.log("Employee API response:", response.data);

      const employeeList = Array.isArray(response.data?.employees)
        ? response.data.employees
        : Array.isArray(response.data?.users)
        ? response.data.users
        : Array.isArray(response.data)
        ? response.data
        : [];

      console.log("Employees:", employeeList);

      setEmployees(employeeList);

    } catch (error) {

      console.error(
        "Employee productivity API error:",
        error
      );

      setError(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to load employees."
      );

    } finally {

      setLoading(false);

    }
  };

  const getRoleName = (role) => {

    if (role === "project_lead") {
      return "Project Lead";
    }

    if (role === "user") {
      return "Employee";
    }

    return role || "Employee";
  };

  if (loading) {

    return (
      <div className="employee-status-container">
        <h2>Loading employee details...</h2>
      </div>
    );

  }

  if (error) {

    return (
      <div className="employee-status-container">
        <h2>{error}</h2>
      </div>
    );

  }

  return (

    <div className="employee-status-container">

      <div className="employee-page-header">

        <div>
          <h2>Employee Productivity</h2>

          <p>
            View employee productivity and task activity
          </p>
        </div>

      </div>

      <div className="employee-list">

        {employees.length === 0 ? (

          <div className="empty-employees">
            No employee details found.
          </div>

        ) : (

          employees.map((employee) => (

            <div
              key={employee.id || employee.email}
              className="employee-productivity-card"
              // onClick={() =>
              //   navigate(
              //     `/user/productivity/${employee.id}`
              //   )
              // }
            >

              {/* Employee */}
              <div className="employee-info">

                <UserAvatar
                  src={employee.profile_picture}
                  alt={employee.name}
                  className="employee-avatar-img"
                />

                <div>

                  <div className="employee-name">
                    {employee.name}
                  </div>

                  <div className="employee-email">
                    {employee.email}
                  </div>

                  <div className="employee-role">
                    {getRoleName(employee.role)}
                  </div>

                </div>

              </div>

              {/* Tasks */}
              <div className="employee-stat">

                <span>Total Tasks</span>

                <strong>
                  {employee.total_tasks ?? employee.active_projects ?? 0}
                </strong>

              </div>

              {/* Completed */}
              <div className="employee-stat">

                <span>Completed</span>

                <strong>
                  {employee.completed_tasks ?? employee.completed ?? 0}
                </strong>

              </div>

              {/* Pending */}
              <div className="employee-stat">

                <span>Pending</span>

                <strong>
                  {employee.pending_tasks ?? employee.in_progress ?? 0}
                </strong>

              </div>

              {/* Time */}
              <div className="employee-stat">

                <span>Time Spent</span>

                <strong>
                  {employee.time_spent || employee.worked_hours || "00h 00m"}
                </strong>

              </div>
              {isAdminOrLead && (
                <div className="employee-export-action">
                  <button
                    type="button"
                    className="employee-export-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExportEmployee(employee);
                    }}
                  >
                    <FiDownload size={16} />
                    Export
                  </button>
                </div>
              )}

            </div>

          ))

        )}

      </div>

      {exportEmployee && (
  <div
    className="productivity-export-overlay"
    onClick={() => {
      if (!exporting) {
        setExportEmployee(null);
      }
    }}
  >
    <div
      className="productivity-export-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="productivity-export-header">

        <div>
          <h3>
            Export Productivity
          </h3>

          <p>
            {exportEmployee.name}
          </p>
        </div>

        <button
          type="button"
          className="productivity-export-close"
          onClick={() => {
            if (!exporting) {
              setExportEmployee(null);
            }
          }}
        >
          <FiX size={20} />
        </button>

      </div>


      {/* DATE */}

      <div className="productivity-export-field">

        <label>
          Report Date
        </label>

        <input
          type="date"
          value={exportDate}
          onChange={(e) =>
            setExportDate(e.target.value)
          }
          disabled={exporting}
        />

      </div>


      {/* PERIOD */}

      <div className="productivity-export-field">

        <label>
          Period
        </label>

        <div className="productivity-export-options">

          <button
            type="button"
            className={
              exportPeriod === "daily"
                ? "selected"
                : ""
            }
            onClick={() =>
              setExportPeriod("daily")
            }
            disabled={exporting}
          >
            Daily
          </button>

          <button
            type="button"
            className={
              exportPeriod === "weekly"
                ? "selected"
                : ""
            }
            onClick={() =>
              setExportPeriod("weekly")
            }
            disabled={exporting}
          >
            Weekly
          </button>

          <button
            type="button"
            className={
              exportPeriod === "monthly"
                ? "selected"
                : ""
            }
            onClick={() =>
              setExportPeriod("monthly")
            }
            disabled={exporting}
          >
            Monthly
          </button>

        </div>

      </div>


      {/* FORMAT */}

      <div className="productivity-export-field">

        <label>
          File Format
        </label>

        <div className="productivity-export-options">

          <button
            type="button"
            className={
              exportFormat === "excel"
                ? "selected"
                : ""
            }
            onClick={() =>
              setExportFormat("excel")
            }
            disabled={exporting}
          >
            <FiFileText />
            Excel
          </button>

          <button
            type="button"
            className={
              exportFormat === "pdf"
                ? "selected"
                : ""
            }
            onClick={() =>
              setExportFormat("pdf")
            }
            disabled={exporting}
          >
            <FiFileText />
            PDF
          </button>

        </div>

      </div>


      {/* DOWNLOAD */}

      <button
            type="button"
            className="productivity-export-download"
            onClick={handleExport}
            disabled={exporting}
          >

            <FiDownload size={18} />

            {exporting
              ? "Generating Report..."
              : `Download ${exportFormat === "excel" ? "Excel" : "PDF"}`
            }

          </button>

        </div>
      </div>
    )}

    </div>
  );
};

export default Employeeproductivity;