import React from 'react'

import './Dashboard.css'
import StatusCard from '../components/dashboard/statuscard/StatusCard'
import Graph from '../components/dashboard/graph/Graph'
import Efficiency from '../components/dashboard/efficiency/Efficiency'
import WorkDetails from '../components/dashboard/workersdetails/WorkDetails'
import WorkTaskChart from '../components/dashboard/work_taskchart/WorkTaskChart'
import DashboardProjectDetails from '../components/dashboard/work_taskchart/DashboardProjectDetails'
import Screenshots from '../components/dashboard/work_taskchart/Screenshots'


import OnboardingSteps from '../components/dashboard/onboarding/OnboardingSteps'

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <OnboardingSteps />
      <StatusCard/>

      {/* TOP: Graph + Efficiency */}
      <div className="dashboard-main">
        <div className="dashboard-main-left">
          <Graph/>
        </div>
        <div className="dashboard-main-right">
          <Efficiency/>
        </div>
      </div>

      {/* BOTTOM: Work details full width */}
      <div className="dashboard-bottom">
        <WorkDetails/>
      </div>
      
        <div className="dashboard-work-task">
        <WorkTaskChart/>
        </div>
        <div className="dashboard-work-task">
          <DashboardProjectDetails/>
        </div>
        <div className="dashboard-work-task">
          <Screenshots/>
        </div>

    </div>
  )
}

export default Dashboard
