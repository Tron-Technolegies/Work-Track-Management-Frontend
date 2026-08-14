import React from 'react'
import MyWorkTrackTime from '../components/myworktrack/myworktracktime/MyWorkTrackTime'
import TaskTimeSheet from '../components/myworktrack/timesheet/TaskTimeSheet'
import MyTaskCard from '../components/myworktrack/mytaskcard/MyTaskCard'
import UnfinishedTasks from '../components/myworktrack/unfinishedtask/UnfinishedTasks'
import './MyWorkTrackPage.css'
import MyProjects from '../components/myworktrack/myprojects/MyProjects'

function MyWorkTrackPage() {
  return (
    <div className="worktrack-page">

      <MyWorkTrackTime />

      {/* TOP TASK CARD */}
      <div className="worktrack-main-task">
        <MyTaskCard />
      </div>

      {/* PROJECTS + UNFINISHED TASKS */}
      <div className="worktrack-projects-row">
        <MyProjects />
        <UnfinishedTasks />
      </div>

      <TaskTimeSheet />

    </div>
  )
}

export default MyWorkTrackPage