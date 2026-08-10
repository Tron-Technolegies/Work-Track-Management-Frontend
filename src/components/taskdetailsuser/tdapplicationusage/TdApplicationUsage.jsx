import React from 'react'
import "./TdApplicationUsage.css"

const TdApplicationUsage = () => {
     const data = [
    { app: "VSCode", time: "2h 15m", idle: "0h 15m" },
    { app: "VSCode", time: "2h 15m", idle: "0h 15m" },
    { app: "VSCode", time: "2h 15m", idle: "0h 15m" },
  ];
  return (
    <div>
        <div className="td-app-usage-card">
      <p className="td-app-usage-title">Application Usage</p>

      <table className="td-app-usage-table">
        <thead>
          <tr>
            <th>Application</th>
            <th>Time spend</th>
            <th>Idle Time</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="atd-pp-name">{item.app}</td>
              <td>{item.time}</td>
              <td>{item.idle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      
    </div>
  )
}

export default TdApplicationUsage
