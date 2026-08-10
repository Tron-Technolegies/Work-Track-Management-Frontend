import React from 'react'
import ProjecteDetailsForm from '../components/userprojects/projectdetailsforms/ProjecteDetailsForm'
import "./UserProjectDetailsPage.css";

const UserProjectDetailsPage = () => {
  return (
    <div className="project-details-page-container animate-fade-in-long">
      <div className="project-details-content-area animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <ProjecteDetailsForm />
      </div>
    </div>
  )
}

export default UserProjectDetailsPage
