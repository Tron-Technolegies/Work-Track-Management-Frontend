import React from 'react'
import MyWorkTrackTime from '../components/myworktrack/myworktracktime/MyWorkTrackTime'
import TaskTimeSheet from '../components/myworktrack/timesheet/TaskTimeSheet'
import MyTaskCard from '../components/myworktrack/mytaskcard/MyTaskCard'
import UnfinishedTasks from '../components/myworktrack/unfinishedtask/UnfinishedTasks'
import './MyWorkTrackPage.css'
import MyProjects from '../components/myworktrack/myprojects/MyProjects'


function MyWorkTrackPage() {
  return (
        <div>
            <MyWorkTrackTime/>
            <div className="worktrack-tasks-row">
                <div className="worktrack-left-col">
                    <MyTaskCard/>
                    <MyProjects/>
                </div>
                <UnfinishedTasks/>
            </div>
            <TaskTimeSheet/>
        </div>
  )
}

export default MyWorkTrackPage