import React from 'react'
import MyTasks from '../components/tasks/mytasks/MyTasks'
import TaskSummary from '../components/tasks/taskSummary/TaskSummary'

function TaskPage() {
  return (
    <div>
        <MyTasks/>
        <TaskSummary/>
    </div>
  )
}

export default TaskPage