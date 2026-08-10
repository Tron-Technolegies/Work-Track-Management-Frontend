import React from "react";
import { createPortal } from "react-dom";
import "../../employees/createemployees/CreateEmployees.css";
import NewTask from "./NewTask";

const NewTaskModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-card" onClick={(e) => e.stopPropagation()}>
        <NewTask isModal={true} onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>,
    document.body
  );
};

export default NewTaskModal;
