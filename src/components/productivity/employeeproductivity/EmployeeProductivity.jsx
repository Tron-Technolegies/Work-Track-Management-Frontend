import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeProductivity.css";
import api from "../../../api/api";
import UserAvatar from "../../common/UserAvatar";

const Employeeproductivity = ({ user }) => {

  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState("");

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

            </div>

          ))

        )}

      </div>

    </div>
  );
};

export default Employeeproductivity;