import React, { useEffect, useState } from "react";
import "./WorkTaskChart.css";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
import api from "../../../api/api";

export default function WorkTaskChart() {
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    at_work_total: "0 hr",
    task_spent_total: "0 hr",
    billable_total: "0 hr",
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchWorkTaskData();
  }, []);

  const fetchWorkTaskData = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin_app/dashboard/work-task-chart/");
      if (res.data) {
        setSummary({
          at_work_total: res.data.at_work_total || "0 hr",
          task_spent_total: res.data.task_spent_total || "0 hr",
          billable_total: res.data.billable_total || "0 hr",
        });
        setChartData(res.data.chart_data || []);
      }
    } catch (err) {
      console.error("Failed to load work/task chart data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worktask-card">
      <div className="worktask-header">
        <h3>Work/Task</h3>

        <div className="date-picker-wrapper">
          <FiCalendar />
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            customInput={<button className="date-btn">Today</button>}
          />
        </div>
      </div>

      <div className="worktask-body">
        <div className="worktask-summary">
          <div className="summary-item">
            <div>At Work</div>
            <h2>{summary.at_work_total}</h2>
          </div>

          <div className="summary-item">
            <span>Task Spent</span>
            <h2>{summary.task_spent_total}</h2>
          </div>

          <div className="summary-item">
            <span>Billable Hour</span>
            <h2>{summary.billable_total}</h2>
          </div>
        </div>

        <div className="chart-wrapper">
          {loading ? (
            <p style={{ padding: "40px", color: "#94a3b8", textAlign: "center" }}>
              Loading Work/Task chart data...
            </p>
          ) : chartData.length === 0 ? (
            <p style={{ padding: "40px", color: "#94a3b8", textAlign: "center" }}>
              No Work/Task data logged yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={chartData} barGap={4} barCategoryGap={18}>
                <CartesianGrid vertical stroke="#ddd" horizontal={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="work" fill="#8e44ad" name="At Work (hrs)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="task" fill="#b16fd5" name="Task Spent (hrs)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="billable" fill="#deb4f4" name="Billable (hrs)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}