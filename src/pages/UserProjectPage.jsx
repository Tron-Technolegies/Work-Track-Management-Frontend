import React from 'react'
import ProjectNavbar from '../components/userprojects/projectnavbar/ProjectNavbar'
import ProjectDetailsAll from '../components/userprojects/projectdetailsall/ProjectDetailsAll'
import "./UserProjectPage.css";

const UserProjectPage = () => {
  return (
    <div className="projects-page-container animate-fade-in-long">
      {/* <ProjectNavbar /> */}
      <div className="projects-content-area animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <ProjectDetailsAll />
      </div>
    </div>
  )
}

export default UserProjectPage
