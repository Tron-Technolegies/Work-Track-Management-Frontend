import React from 'react'
import "./ProjectNavbar.css"
import { CiSearch } from "react-icons/ci";


const ProjectNavbar = () => {
  return (
    <>
        <nav className="project-navbar">
          <div className="project-navtitle">Project</div>
    
          <div className="project-search-box">
            <CiSearch className="project-search-icon" />
            <input
              className="project-search-input"
              type="project-text"
              placeholder="Start Searching Here..."
            />
          </div>
        </nav>


    </>
  )
}

export default ProjectNavbar
