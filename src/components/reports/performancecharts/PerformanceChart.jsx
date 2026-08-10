import React, { useRef, useState, useMemo } from "react";
import "./PerformanceCharts.css"

const DATA = [10, 6, 12, 10, 8, 6, 12];
const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LINE_COLOR = "#b279c5";
const GRAD_TOP = "rgba(178, 121, 197, 0.2)";
const GRAD_MID = "rgba(178, 121, 197, 0.05)";

function PerformanceChart({
  data = DATA,
  labels = LABELS,
  height = 360,
  padding = 40,
}) {
  const svgRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const min = 0;
  const max = Math.max(...data, 12);
  const count = data.length;

  const viewW = 1000;
  const viewH = height;
  const innerW = viewW - padding * 2;
  const innerH = viewH - padding * 2;

  const points = useMemo(() => {
    return data.map((v, i) => {
      const x = padding + (i / (count - 1)) * innerW;
      const y = padding + (1 - (v - min) / (max - min)) * innerH;
      return { x, y, v, label: labels[i] || "" };
    });
  }, [data, labels, count, padding, innerW, innerH, min, max]);

  function catmullRom2bezier(pts) {
    if (!pts.length) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const bp1x = p1.x + (p2.x - p0.x) / 6;
      const bp1y = p1.y + (p2.y - p0.y) / 6;
      const bp2x = p2.x - (p3.x - p1.x) / 6;
      const bp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${bp1x},${bp1y} ${bp2x},${bp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  const linePath = catmullRom2bezier(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x
    },${viewH - padding} L ${points[0].x},${viewH - padding
    } Z`;

  const ySteps = [0, 3, 6, 9, 12];

  return (
    <div
      style={{
        margin: "32px 0",
        width: "100%",
        padding: "24px",
        backgroundColor: "var(--bg-card)",
        borderRadius: "var(--radius-standard)",
        border: "1px solid var(--border-standard)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--text-dark)",
          fontFamily: "'Outfit', sans-serif"
        }}>Performance Trends</h3>
        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>Weekly activity overview</p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewW} ${viewH}`}
        width="100%"
        height={height}
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GRAD_TOP} />
            <stop offset="100%" stopColor={GRAD_MID} />
          </linearGradient>
        </defs>

        {/* Y-axis grid */}
        {ySteps.map((val, i) => {
          const y = padding + (1 - val / max) * innerH;
          return (
            <g key={i}>
              <line
                x1={padding}
                x2={viewW - padding}
                y1={y}
                y2={y}
                stroke="var(--border-light)"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 15}
                y={y + 4}
                fontSize="12"
                fontWeight="600"
                textAnchor="end"
                fill="var(--text-muted)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill="url(#purpleGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={LINE_COLOR}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* X labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={viewH - padding + 30}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="var(--text-muted)"
          >
            {labels[i]}
          </text>
        ))}

        {/* Points + Hover */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 10 : 0}
              fill={LINE_COLOR}
              style={{ transition: "r 0.2s ease" }}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 6 : 0}
              fill="#fff"
              style={{ transition: "r 0.2s ease" }}
            />

            {/* Tooltip */}
            {hoverIndex === i && (
              <g>
                <rect
                  x={p.x - 45}
                  y={p.y - 50}
                  width={90}
                  height={34}
                  rx={8}
                  fill="var(--text-dark)"
                />
                <text
                  x={p.x}
                  y={p.y - 28}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="#fff"
                >
                  {p.label}: {p.v}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

export default PerformanceChart