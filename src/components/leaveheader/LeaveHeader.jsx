import React from 'react'
import "./LeaveHeader.css"

function LeaveHeader({
    category,
    title,
    subtitle
}) {
  return (
           <div className="leave-header">

            <p className="leave-category">
                {category}
            </p>

            <h1 className="leave-title">
                {title}
            </h1>

            <p className="leave-subtitle">
                {subtitle}
            </p>

        </div>
  )
}

export default LeaveHeader