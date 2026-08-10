import React from 'react'
import DashboardNavbar from "../components/userdashboard/dashboardnavbar/DashboardNavbar"
import DashboardCard from '../components/userdashboard/dashboardcard/DashboardCard'
import DashboardStatistics from '../components/userdashboard/dashboardstatistics/DashboardStatistics'
import DashboardProject from '../components/userdashboard/dashboardproject/DashboardProject'
import DashboardUnfinisedTasks from '../components/userdashboard/dashboardunfinishedtasks/DashboardUnfinisedTasks'
import "./UserDashboardPage.css";

const UserDashboardPage = () => {
  return (
    <div className="dashboard-page-container animate-fade-in-long">
      {/* <DashboardNavbar /> */}

      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <DashboardCard />
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-main-column animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <DashboardStatistics />
          <DashboardProject />
        </div>

        <aside className="dashboard-side-column animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <DashboardUnfinisedTasks />
        </aside>
      </div>
    </div>
  )
}

export default UserDashboardPage
