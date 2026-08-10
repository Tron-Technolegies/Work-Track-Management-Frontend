import React from 'react'
import "./ProjectDetailsNavbar.css"
import { CiSearch } from "react-icons/ci";


const ProjectDetailsNavbar = () => {
  return (
    <div>
               <nav className="project-navbar">
                  <div className="project-navtitle">Project <span>ProjectDetails</span></div>
            
                  <div className="project-search-box">
                    <CiSearch className="project-search-icon" />
                    <input
                      className="project-search-input"
                      type="project-text"
                      placeholder="Start Searching Here..."
                    />
                  </div>
                </nav>
      
    </div>
  )
}

export default ProjectDetailsNavbar
