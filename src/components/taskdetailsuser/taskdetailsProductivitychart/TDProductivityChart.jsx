import React, { useEffect, useState } from "react";
import api from "../../../api/api";
import "./TDProductivityChart.css";
import { FiPlayCircle, FiPauseCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";

const TDProductivityChart = ({ taskId }) => {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    const checkRunningSession = async () => {
      try {
        const res = await api.get(`/admin_app/tasks/${taskId}/running/`);
        if (res.data.running) {
          setRunning(true);
          setSeconds(res.data.elapsed_seconds);
        }
      } catch (err) {
        console.error("Auto-resume failed", err);
      }
    };
    checkRunningSession();
  }, [taskId]);

  useEffect(() => {
    let interval = null;
    if (running) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const startTask = async () => {
    setLoading(true);
    try {
      await api.post(`/admin_app/tasks/${taskId}/start/`);
      setRunning(true);
      toast.success("Task started! Go get 'em! 🚀");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start task.");
    } finally {
      setLoading(false);
    }
  };

  const stopTask = async () => {
    setLoading(true);
    try {
      const workedTime = formatTime(seconds);
      await api.post(`/admin_app/tasks/${taskId}/stop/`);
      setRunning(false);
      toast.success(`Task Stopped! Total time worked: ${workedTime}`, {
        duration: 5000,
        icon: '⏱️',
      });
      setSeconds(0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to stop task properly.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const remainingSeconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="productivity-column-wrapper">
      <button
        className={`task-play-btn ${running ? 'running' : ''}`}
        onClick={running ? stopTask : startTask}
        disabled={loading}
      >
        <span>{running ? "Stop" : "Start"}</span>
        {running ? <FiPauseCircle /> : <FiPlayCircle />}
      </button>

      <div className="productivity-card-new">
        <h4 className="card-title">Productivity</h4>

        <div className="chart-content">
          <div className="donut-chart-container">
            <svg viewBox="0 0 100 100" className="donut-svg">
              <circle className="donut-segment productive" cx="50" cy="50" r="40" strokeDasharray="40 60" strokeDashoffset="25"></circle>
              <circle className="donut-segment neutral" cx="50" cy="50" r="40" strokeDasharray="30 70" strokeDashoffset="85"></circle>
              <circle className="donut-segment unproductive" cx="50" cy="50" r="40" strokeDasharray="30 70" strokeDashoffset="55"></circle>
            </svg>
          </div>

          <div className="chart-legend">
            <div className="legend-timer">
              <span className="timer-label">Timer:</span>
              <span className="timer-value">{formatTime(seconds)}</span>
            </div>
            <div className="legend-item">
              <span className="dot productive"></span>
              <span className="label">Productive 40%</span>
            </div>
            <div className="legend-item">
              <span className="dot neutral"></span>
              <span className="label">Neutral 30%</span>
            </div>
            <div className="legend-item">
              <span className="dot unproductive"></span>
              <span className="label">Unproductive 30%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TDProductivityChart;
