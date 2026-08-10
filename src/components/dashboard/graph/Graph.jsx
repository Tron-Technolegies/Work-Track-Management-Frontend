import React, { useEffect, useState } from "react";
import api from "../../../api/api";
import "./Graph.css";

const Graph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const maxHours = 8;
  const ticks = [8, 6, 4, 2, 0];

  const toPct = (h) => Math.max(0, Math.min(100, (h / maxHours) * 100));

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin_app/reports/weekly-work/");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setData(res.data);
      } else {
        // Fallback week days structure if empty
        setData([
          { day: "Mon", hours: 0 },
          { day: "Tue", hours: 0 },
          { day: "Wed", hours: 0 },
          { day: "Thu", hours: 0 },
          { day: "Fri", hours: 0 },
          { day: "Sat", hours: 0 },
          { day: "Sun", hours: 0 },
        ]);
      }
    } catch (err) {
      console.error("Failed to load work report", err);
      setData([
        { day: "Mon", hours: 0 },
        { day: "Tue", hours: 0 },
        { day: "Wed", hours: 0 },
        { day: "Thu", hours: 0 },
        { day: "Fri", hours: 0 },
        { day: "Sat", hours: 0 },
        { day: "Sun", hours: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="graph-card"><p style={{ padding: "20px", color: "#94a3b8" }}>Loading work report...</p></div>;
  }

  return (
    <div className="graph-card">
      <div className="graph-header">
        <div>
          <h3 className="graph-title">Work Report</h3>
          <div className="graph-subtle">8 hr</div>
        </div>
      </div>

      <div className="graph-body">
        <div className="graph-yaxis">
          {ticks.map((t) =>
            t === 0 ? (
              <div key={t} className="graph-y-row empty" />
            ) : (
              <div key={t} className="graph-y-row">
                <span className="graph-y-label">{t} hr</span>
              </div>
            )
          )}
        </div>

        <div className="graph-plot">
          <div className="graph-grid">
            {ticks.map((_, i) => (
              <div
                key={i}
                className="graph-grid-line"
                style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
              />
            ))}
          </div>

          <div className="graph-bars">
            {data.map((d) => {
              const pct = toPct(d.hours || 0);
              const greyPct = 100 - pct;

              return (
                <div className="graph-bar-col" key={d.day}>
                  <div className="graph-bar-viewport">
                    <div className="graph-bar-bg" />

                    <div
                      className="graph-bar-grey"
                      style={{ height: `${greyPct}%` }}
                    />

                    <div
                      className="graph-bar-fill"
                      style={{ height: `${pct}%` }}
                      title={`${d.day}: ${d.hours || 0} hr`}
                    />
                  </div>

                  <div className="graph-day-label">{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graph;
