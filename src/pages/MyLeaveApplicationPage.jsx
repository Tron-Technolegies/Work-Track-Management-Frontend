import React from 'react'
import MyLeaveApplicationCard from '../components/userleaves/myleaveapplications/myleaveapplicationcard/MyLeaveApplicationCard'
import LeaveHeader from '../components/leaveheader/leaveheader'
import MyLeaveHistory from '../components/userleaves/myleaveapplications/myleavehistory/MyLeaveHistory'
import "./MyLeaveApplicationPage.css"

function MyLeaveApplicationPage() {
  return (
    <div className='my-leave-application-page'>
      <LeaveHeader category="LEAVE MANAGEMENT" title="My Applications"/>
      <div><MyLeaveApplicationCard/></div>
      <div><MyLeaveHistory/></div>  
    
    </div>
  )
}

export default MyLeaveApplicationPage