import React from "react";
import "./ProductivityPieChart.css";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

function ProductivityPieChart({ productivity }) {
  const chartData = [
    {
      name: "Productive",
      value: productivity?.productive ?? 60,
      color: "#BB77E3",
    },
    {
      name: "Neutral",
      value: productivity?.neutral ?? 25,
      color: "#A147C8",
    },
    {
      name: "Unproductive",
      value: productivity?.unproductive ?? 15,
      color: "#E3B5F4",
    },
  ];

  return (
    <div className="productivity-chart-card">
      <h2 className="productivity-chart-title">Productivity</h2>

      <div className="productivity-chart-body">
        <div className="productivity-pie">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={48}
                outerRadius={78}
                stroke="none"
                paddingAngle={0}
              >
                {chartData.map((item, index) => (
                  <Cell key={index} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="productivity-legend">
          {chartData.map((item) => (
            <div className="legend-item" key={item.name}>
              <span
                className="legend-dot"
                style={{
                  background: item.color,
                }}
              ></span>

              <span className="legend-text">
                {item.name} {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductivityPieChart;