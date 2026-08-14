import React from 'react'
import './LeaveApprovalPage.css'
import LeaveHeader from '../components/leaveheader/LeaveHeader'
import LeaveApprovalCards from '../components/adminleave/leaveapprovals/LeaveApprovalCards'
import AllLeaveHistory from '../components/adminleave/leavehistory/AllLeaveHistory'
import { Link } from 'react-router-dom'
import { FiLock, FiArrowLeft } from 'react-icons/fi'

function LeaveApprovalPage() {
  const userRole = (localStorage.getItem("user_role") || "user").toLowerCase();
  const canApprove = userRole === "admin" || userRole === "super_admin" || userRole === "project_lead";

  if (!canApprove) {
    return (
      <div className="leave-types-denied-container animate-fade-in">
        <div className="denied-card">
          <div className="lock-icon-box">
            <FiLock size={32} />
          </div>
          <h2>Lead / Admin Access Required</h2>
          <p>
            The Leave Approvals section is restricted to Project Leads and Administrators.
            You can view your own leave applications under "My Applications".
          </p>
          <Link to="/user/leave/apply_leave" className="back-btn">
            <FiArrowLeft size={16} />
            <span>Go to Apply Leave</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='leave-approval-page'>
        <LeaveHeader category="APPROVAL PANEL" title="Leave Approvals" subtitle="Review and manage employee leave requests"/>
        <div><LeaveApprovalCards/></div>
        <div><AllLeaveHistory/></div> 
    </div>
  )
}

export default LeaveApprovalPage