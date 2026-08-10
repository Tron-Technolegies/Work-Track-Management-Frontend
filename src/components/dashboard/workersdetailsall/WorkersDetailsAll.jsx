import { useNavigate } from "react-router-dom";
import "./WorkDetailsAll.css";
import api from "../../../api/api";
import React, { useState, useEffect } from "react";

const WorkersDetailsAll = () => {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await api.get("admin_app/tasks/");
      setRows(res.data.tasks);   // 👈 tasks list set
    } catch (err) {
      console.log("Failed to load workers", err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div className="workers-details-all-container">

        <div className="wokers-details-all-title-box">
          <div className="workers-detail-left">
            <div className="working-details">Dashboard</div>
            <div className="date-and-status">/ Working Details</div>
          </div>

          <div className="workers-details-right">
            <div className="worker-detail-status">Status</div>
            <div className="date-icon">
              <img src="/Vector (5).svg" alt="calendar" />
            </div>
            <div className="worker-detail-dates">Today</div>
          </div>
        </div>

        <div className="workers-details-tables">
          <table className="dashboard-table">

            <thead>
              <tr className="dashboard-header-row">
                <th className="dashboard-th">User Name</th>
                <th className="dashboard-th">Task Name</th>
                <th className="dashboard-th">Due Date</th>
                <th className="dashboard-th">Status</th>
                <th className="dashboard-th">Working Hours</th>
                <th className="dashboard-th">Priority</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="dashboard-tr">

                  <td className="dashboard-td user-cell">
                    <div className="avatar">
                      <img src={row.img || "/photo icon male.svg"} alt="" />
                    </div>

                    <div className="user-name">
                      {row.assigned_to?.length > 0
                        ? row.assigned_to.map((u, idx) => (
                          <span
                            key={u.id}
                            onClick={() => navigate(`/employeeproductivity/${u.id}`)}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            {u.first_name} {u.last_name}{idx < row.assigned_to.length - 1 ? ", " : ""}
                          </span>
                        ))
                        : "—"
                      }
                    </div>
                  </td>

                  <td className="dashboard-td task-cell">
                    {row.task_name || "—"}
                  </td>

                  <td className="dashboard-td">
                    {row.due_date || "—"}
                  </td>

                  <td className="dashboard-td">
                    <span
                      className={`status-pill ${(row.status || "")
                        .toLowerCase()
                        .replace(" ", "-")
                        }`}
                    >
                      {row.status || "—"}
                    </span>
                  </td>

                  <td className="dashboard-td">
                    {row.working_hours || "—"}
                  </td>

                  <td className="dashboard-td">
                    <span
                      className={`priority-pill ${(row.priority || "").toLowerCase()
                        }`}
                    >
                      {row.priority || "—"}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </>
  );
};

export default WorkersDetailsAll;
