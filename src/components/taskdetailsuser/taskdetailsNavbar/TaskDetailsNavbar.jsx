import React from 'react';
import './TaskDetailsNavbar.css';
import { FiSearch } from 'react-icons/fi';

const TaskDetailsNavbar = () => {
  return (
    <nav className="task-details-nav">
      <div className="breadcrumb-area">
        <span className="breadcrumb-parent">Tasks</span>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">Task Details (Redesign Active)</span>
      </div>

      <div className="search-box-centered">
        <FiSearch className="search-icon" />
        <input
          className="search-input"
          type="text"
          placeholder="Start Searching Here..."
        />
      </div>
    </nav>
  );
};

export default TaskDetailsNavbar;
