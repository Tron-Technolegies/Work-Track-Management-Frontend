import React from 'react'
import "./LeaveLayout.css"
import { Outlet } from 'react-router-dom'

function LeaveLayout() {
  return (
    <div className="leave-layout">
      <div className="leave-content">
        <Outlet />
      </div>
    </div>
  )
}

export default LeaveLayout