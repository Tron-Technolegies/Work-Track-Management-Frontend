import React from 'react'
import ApplyLeaveForm from '../components/userleaves/applyleave/applyleaveform/ApplyLeaveForm'
import LeaveBalance from '../components/userleaves/applyleave/leavebalance/LeaveBalance'
import LeavePolicy from '../components/userleaves/applyleave/leavepolicy/LeavePolicy'
import RecentLeaveApplication from '../components/userleaves/applyleave/recentleaveapplication/RecentLeaveApplication'
import './UserApplyLeavePage.css'
import LeaveHeader from '../components/leaveheader/leaveheader'

function UserApplyLeavePage() {
  return (
    <div className='user-apply-leave-page'>
        <div className='apply-leave-form'>
          <LeaveHeader 
              category="LEAVE MANAGEMENT"

              title="Apply for Leave"

              subtitle="Fill in the details below to submit a leave request for admin approval."
/>
            <ApplyLeaveForm/>
        </div>
        <div className='leave-info'>
            <LeaveBalance/>
            <LeavePolicy/>
            <RecentLeaveApplication/>
        </div>
        


    </div>
  )
}

export default UserApplyLeavePage