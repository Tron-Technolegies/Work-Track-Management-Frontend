import React from "react";
import { createPortal } from "react-dom";
import "../../employees/createemployees/CreateEmployees.css";
import NewProject from "./NewProject";

const NewProjectModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-card" onClick={(e) => e.stopPropagation()}>
        <NewProject isModal={true} onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>,
    document.body
  );
};

export default NewProjectModal;
