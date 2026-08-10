import React from 'react'
import './LeaveApprovalPage.css'
import LeaveHeader from '../components/leaveheader/leaveheader'
import LeaveApprovalCards from '../components/adminleave/leaveapprovals/LeaveApprovalCards'
import AllLeaveHistory from '../components/adminleave/leavehistory/AllLeaveHistory'

function LeaveApprovalPage() {
  return (
    <div className='leave-approval-page'>
        <LeaveHeader category="Admin Panel" title="Leave Approvals" subtitle="Review and manage all employee leave requests"/>
        <div><LeaveApprovalCards/></div>
        <div><AllLeaveHistory/></div> 
    </div>
  )
}

export default LeaveApprovalPage