import React from 'react'
import LeaveBalanceCard from '../components/userleaves/leavebalance/LeaveBalanceCard'
import LeaveHeader from '../components/leaveheader/leaveheader'
import './LeaveBalancePage.css'

function LeaveBalancePage() {
  return (
    <div className='leave-balance-page'>
        <LeaveHeader category="Leave Management" title="Leave Balance"/>
        <LeaveBalanceCard/>
    </div>
  )
}

export default LeaveBalancePage