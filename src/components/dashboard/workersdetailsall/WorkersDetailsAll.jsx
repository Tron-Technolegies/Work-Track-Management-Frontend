import { useNavigate } from "react-router-dom";
import "./WorkDetailsAll.css";
import api from "../../../api/api";
import UserAvatar from "../../common/UserAvatar";
import {
  FiCalendar,
  FiChevronDown,
  FiX
} from "react-icons/fi";
import React, { useState, useEffect } from "react";

const WorkersDetailsAll = () => {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const navigate = useNavigate();

  // ==========================================
  // FETCH TASKS
  // ==========================================

  useEffect(() => {
    fetchWorkers();
  }, [statusFilter, dateFilter]);

  const fetchWorkers = async () => {

    try {

      setLoading(true);

      const params = new URLSearchParams();

      if (statusFilter && statusFilter !== "All") {
        params.append("status", statusFilter);
      }

      if (dateFilter) {
        params.append("date", dateFilter);
      }

      const url = params.toString()
        ? `admin_app/tasks/?${params.toString()}`
        : "admin_app/tasks/";

      const res = await api.get(url);

      setRows(res.data.tasks || []);

    } catch (err) {

      console.error("Failed to load tasks", err);

      setRows([]);

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setStatusFilter("All");
    setDateFilter("");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="workers-details-loading">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="workers-details-all-container">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="wokers-details-all-title-box">

        <div className="workers-detail-left">

          <div className="working-details">
            Dashboard
          </div>

          <div className="date-and-status">
            / Working Details
          </div>

        </div>


        {/* ==========================================
            FILTERS
        ========================================== */}

        <div className="workers-details-right">

          {/* STATUS */}

          <div className="work-filter">

            <span className="filter-label">
              Status
            </span>

            <div className="status-select-wrapper">

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="work-status-select"
              >

                <option value="All">
                  All
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="To Do">
                  To Do
                </option>

                <option value="Completed">
                  Completed
                </option>

              </select>

              <FiChevronDown className="select-arrow" />

            </div>

          </div>


          {/* DATE */}

          <div className="work-filter">

            <span className="filter-label">
              Date
            </span>

            <div className="date-filter-wrapper">

              <FiCalendar className="date-filter-icon" />

              <input
                type="date"
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(e.target.value)
                }
                className="work-date-input"
              />

            </div>

          </div>


          {/* CLEAR */}

          {(statusFilter !== "All" || dateFilter) && (

            <button
              type="button"
              className="clear-work-filters"
              onClick={clearFilters}
              title="Clear filters"
            >
              <FiX />
            </button>

          )}

        </div>

      </div>


      {/* ==========================================
          TABLE
      ========================================== */}

      <div className="workers-details-tables">

        <table className="dashboard-table">

          <thead>

            <tr className="dashboard-header-row">

              <th className="dashboard-th">
                Employee
              </th>

              <th className="dashboard-th">
                Task Name
              </th>

              <th className="dashboard-th">
                Due Date
              </th>

              <th className="dashboard-th">
                Status
              </th>

              <th className="dashboard-th">
                Task Time Spent
              </th>

              <th className="dashboard-th">
                Priority
              </th>

            </tr>

          </thead>


          <tbody>

            {rows.length > 0 ? (

              rows.map((row) => (

                <tr
                  key={row.id}
                  className="dashboard-tr"
                >

                  {/* EMPLOYEE */}

                  <td className="dashboard-td">

                    <div className="user-cell">

                      <div className="avatar">

                        <UserAvatar
                          src={row.assigned_to?.[0]?.profile_picture}
                          alt="Employee"
                        />

                      </div>


                      <div className="user-name">

                        {row.assigned_to?.length > 0
                          ? row.assigned_to.map((u, idx) => {

                              const fullName =
                                `${u.first_name || ""} ${
                                  u.last_name || ""
                                }`.trim();

                              const displayName =
                                fullName ||
                                u.username ||
                                "Employee";

                              return (

                                <span
                                  key={u.id || idx}
                                  onClick={() =>
                                    navigate(
                                      `/employeeproductivity/${u.id}`
                                    )
                                  }
                                  className="employee-name-link"
                                >

                                  {displayName}

                                  {idx <
                                    row.assigned_to.length - 1
                                    ? ", "
                                    : ""}

                                </span>

                              );

                            })
                          : "—"}

                      </div>

                    </div>

                  </td>


                  {/* TASK */}

                  <td className="dashboard-td task-cell">
                    {row.task_name || "—"}
                  </td>


                  {/* DATE */}

                  <td className="dashboard-td">
                    {row.due_date || "—"}
                  </td>


                  {/* STATUS */}

                  <td className="dashboard-td">

                    <span
                      className={`status-pill ${
                        (row.status || "")
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                      }`}
                    >
                      {row.status || "—"}
                    </span>

                  </td>


                  {/* TIME */}

                  <td className="dashboard-td">

                    <span className="time-spent">

                      {row.time_spent || "00h 00m"}

                    </span>

                  </td>


                  {/* PRIORITY */}

                  <td className="dashboard-td">

                    <span
                      className={`priority-pill ${
                        (row.priority || "").toLowerCase()
                      }`}
                    >
                      {row.priority || "—"}
                    </span>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="no-tasks-message"
                >
                  No tasks found for the selected filters.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default WorkersDetailsAll;