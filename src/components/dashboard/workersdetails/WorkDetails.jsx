import React, { useEffect, useState } from 'react';
import "./WorkDetails.css";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";

const WorkDetails = () => {

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get(
        `admin_app/employees/efficiency/`
      );

      const formatted = res.data.map((user, index) => ({
        id: index,
        name: user.user,
        hour: user.worked_hours,
        time: user.worked_hours,
        efficiency: user.efficiency,
      }));

      setRows(formatted.slice(0, 3));

    } catch (err) {
      console.log("Failed to load work details", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="work-detail-container">
      <div className="detail-head">
        <div className="head-left-side">
          <div className="icon-at">
            <img src="\Group.svg" alt="At work" />
            <p>At Work</p>
          </div>
          <div
  className="viewall-head"
  onClick={() => navigate("/user/workdetailsall")}
  style={{ cursor: "pointer" }}
>
  View all
</div>
        </div>

        {/* <div className="head-right-side">
          <span className="selected-date">
            {formatDisplayDate(selectedDate)}
          </span>

          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            customInput={
              <img
                src="/dates icon.svg"
                alt="calendar"
                className="calendar-icon"
              />
            }
          />
        </div> */}
      </div>

      <div className="user-atwork-head">
        <div className="user-head">User</div>
        <div className="at-work-head">At Work</div>
      </div>

      {rows.map((row, index) => (
        <div className="user-work" key={index}>
          <div className="left-user"
            style={{ cursor: row.id ? 'pointer' : 'default' }}>
            <div className="user">
              <img src="/user icon.svg" alt={row.name} />
              <p>{row.name}</p>
            </div>
          </div>

          <div className='right-atwork'>
            <div className="time-hour">
              <p>{row.hour}</p>

              <div className="dashboard_productivity-efficiency-cell">

                {/* 8 Hour Target Bar */}
                <div className="dashboard_productivity-target-bar-track">
                  <div
                    className="dashboard_productivity-target-bar-fill"
                    style={{ width: "100%" }}
                  />
                </div>

                {/* User Daily Work Bar */}
                <div className="dashboard_productivity-work-bar-track">
                  <div
                    className="dashboard_productivity-work-bar-fill"
                    style={{
                      width: `${row.efficiency || 0}%`
                    }}
                  />
                </div>

                <span className="dashboard_productivity-efficiency-text">
                  {row.time} / 8h
                </span>

              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
export default WorkDetails;
