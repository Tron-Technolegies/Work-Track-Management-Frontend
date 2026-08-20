import React from 'react'
import { Link } from 'react-router-dom'
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import ApplyLeaveForm from '../components/userleaves/applyleave/applyleaveform/ApplyLeaveForm'
import LeaveBalance from '../components/userleaves/applyleave/leavebalance/LeaveBalance'
import LeavePolicy from '../components/userleaves/applyleave/leavepolicy/LeavePolicy'
import RecentLeaveApplication from '../components/userleaves/applyleave/recentleaveapplication/RecentLeaveApplication'
import './UserApplyLeavePage.css'
import LeaveHeader from '../components/leaveheader/LeaveHeader'

function UserApplyLeavePage() {
  const userRole = (localStorage.getItem("user_role") || "user").toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  if (isAdmin) {
    return (
      <div className="user-apply-leave-page" style={{ padding: "30px" }}>
        <div
          style={{
            background: "#ffffff",
            padding: "36px",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "600px",
            margin: "40px auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#ede9fe",
              color: "#7c3aed",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              margin: "0 auto 16px",
            }}
          >
            <FiCheckCircle />
          </div>
          <h2 style={{ fontSize: "20px", color: "#1e293b", marginBottom: "8px" }}>
            Admin Leave Management
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
            Administrators manage and approve employee leave requests. Leave applications are reserved for employees and project leads.
          </p>
          <Link
            to="/user/leave/leave_approval"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#7c3aed",
              color: "#fff",
              padding: "10px 22px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            <span>Go to Leave Approvals</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

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