import React from "react";
import { createPortal } from "react-dom";
import "../../employees/createemployees/CreateEmployees.css";
import EditProject from "./EditProject";

function EditProjectModal({ isOpen, onClose, project, onSuccess }) {
  if (!isOpen || !project) return null;

  return createPortal(
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-card" onClick={(e) => e.stopPropagation()}>
        <EditProject
          project={project}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>,
    document.body
  );
}

export default EditProjectModal;
