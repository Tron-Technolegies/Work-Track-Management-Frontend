import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../../api/api";
import { toast } from "react-toastify";
import { FiFilter, FiUser, FiUsers, FiX } from "react-icons/fi";

import "./EmployeesProductivity.css";
import UserAvatar from "../../common/UserAvatar";

const EmployeesProductivity = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState(["All Teams"]);
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const formatLocalDate = (dateObj) => {
    if (!dateObj) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    if (!date) return "Today";
    const selected = new Date(date);
    const today = new Date();

    const diffDays = Math.floor(
      (today.setHours(0, 0, 0, 0) - selected.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    return selected.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchEmployeesProductivity(selectedDate);
  }, [selectedDate]);

  const fetchTeams = async () => {
    try {
      const res = await api.get("admin_app/view-teams/");
      const list = res.data.data || res.data || [];
      const teamNames = list.map((t) => t.team_name).filter(Boolean);
      setTeams(["All Teams", ...teamNames]);
    } catch {
      // Fallback
    }
  };

  const fetchEmployeesProductivity = async (dateObj) => {
    try {
      setLoading(true);
      let url = "admin_app/employees/productivity/";
      if (dateObj) {
        url += `?date=${formatLocalDate(dateObj)}`;
      }

      const res = await api.get(url);
      // Backend returns { count, employees: [...] }
      const raw = res.data?.employees || res.data?.users || res.data || [];
      const list = Array.isArray(raw) ? raw : [];

      // Normalise fields so the table always has `time` and `percent`
      const normalised = list.map((emp) => {
        const timeSpent = emp.time_spent || emp.time || "00h 00m";
        // Parse hours and minutes for percent calculation (goal = 8h)
        const match = timeSpent.match(/(\d+)h\s*(\d+)m/);
        const totalMins = match
          ? parseInt(match[1]) * 60 + parseInt(match[2])
          : 0;
        const percent = Math.min(Math.round((totalMins / 480) * 100), 100);
        return { ...emp, time: timeSpent, percent };
      });

      setEmployees(normalised);
    } catch (err) {
      console.error("Error fetching productivity data:", err);
      toast.error("Failed to load employee productivity");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const CustomDateInput = React.forwardRef(({ onClick }, ref) => (
    <button
      className="productivity-date-button"
      onClick={onClick}
      ref={ref}
      type="button"
    >
      {formatDisplayDate(selectedDate)}
      <span className="productivity-calendar-arrow">▼</span>
    </button>
  ));

  const handleRowClick = (id) => {
    navigate(`/user/individualproductivity/${id}`);
  };

  // Filter employees by team and user if selected
  const filteredEmployees = employees.filter((emp) => {
    const matchTeam =
      selectedTeam === "All Teams" ||
      emp.team_name === selectedTeam ||
      emp.team === selectedTeam;
    const matchUser =
      selectedUser === "All Users" ||
      emp.id.toString() === selectedUser ||
      emp.name === selectedUser;
    return matchTeam && matchUser;
  });

  const activeFilterCount =
    (selectedTeam !== "All Teams" ? 1 : 0) +
    (selectedUser !== "All Users" ? 1 : 0);

  return (
    <div className="table-container animate-fade-in">
      <div className="productivity-header">
        <h2>Team Productivity</h2>

        <button
          className={`productivity-filter-toggle-btn ${isFilterOpen ? "active" : ""}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FiFilter size={18} />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {isFilterOpen && (
        <div className="productivity-filter-panel animate-fade-in">
          <div className="filter-group">
            <label>
              <FiUsers size={14} /> Team
            </label>
            <select
              className="filter-select"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FiUser size={14} /> User / Employee
            </label>
            <select
              className="filter-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="All Users">All Users</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id.toString()}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button
              className="reset-filter-btn"
              onClick={() => {
                setSelectedTeam("All Teams");
                setSelectedUser("All Users");
              }}
            >
              <FiX size={14} /> Clear Filters
            </button>
          )}
        </div>
      )}

      <div className="employees-table-wrapper">
        <table className="employees-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>
                <div className="productivity-date-filter">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    customInput={<CustomDateInput />}
                  />
                </div>
              </th>
              <th>Efficiency</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="empty-row" style={{ textAlign: "center", padding: "40px" }}>
                  Loading productivity data...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-row" style={{ textAlign: "center", padding: "40px" }}>
                  No productivity data recorded
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => {
                const percent = employee.daily_percent ?? employee.percent ?? 0;
                return (
                  <tr
                    key={employee.id}
                    className="employee-name-datas"
                    onClick={() => handleRowClick(employee.id)}
                    style={{ cursor: "pointer" }}
                  >
                <td className="profile-td">
                    <div className="profile-content">
                        <UserAvatar
                            className="profile-img"
                            src={employee.profile_picture}
                            alt={employee.name}
                        />

                        <span className="img-span">
                            {employee.name}
                        </span>
                    </div>
                </td>

                    <td>{employee.email}</td>

                    <td>{employee.time || "0h 0m"}</td>

                    <td>
                      <div className="productivity-efficiency-cell">
                        {/* 8 Hour Target Track */}
                        <div className="productivity-target-bar-track">
                          <div
                            className="productivity-target-bar-fill"
                            style={{ width: "100%" }}
                          />
                        </div>

                        {/* Employee Progress */}
                        <div className="productivity-work-bar-track">
                          <div
                            className="productivity-work-bar-fill"
                            style={{
                              width: `${Math.min(percent, 100)}%`,
                            }}
                          />
                        </div>

                        <span className="productivity-efficiency-text">
                          {employee.time || "0h 0m"} / 8h
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesProductivity;