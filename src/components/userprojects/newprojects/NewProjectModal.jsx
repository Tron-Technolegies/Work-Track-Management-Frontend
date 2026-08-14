import React from "react";
import { createPortal } from "react-dom";
import "../../employees/createemployees/CreateEmployees.css";
import NewProject from "./NewProject";

const NewProjectModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="employee-modal-overlay">
      <div className="employee-modal-card" >
        <NewProject isModal={true} onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>,
    document.body
  );
};

export default NewProjectModal;
