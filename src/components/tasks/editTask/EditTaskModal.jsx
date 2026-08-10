import React from "react";
import { createPortal } from "react-dom";
import "../../employees/createemployees/CreateEmployees.css";
import EditTask from "./EditTask";

function EditTaskModal({ isOpen, onClose, task, onSuccess }) {
  if (!isOpen || !task) return null;

  return createPortal(
    <div className="employee-modal-overlay" onClick={onClose}>
      <div className="employee-modal-card" onClick={(e) => e.stopPropagation()}>
        <EditTask task={task} onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>,
    document.body
  );
}

export default EditTaskModal;
