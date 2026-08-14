import { createPortal } from "react-dom";
import "./CreateEmployees.css";
import CreateEmployees from "./CreateEmployees";

function CreateEmployeeModal({ isOpen, onClose, onSuccess }) {

    if (!isOpen) return null;

    return createPortal(
        <div className="employee-modal-overlay">
            <div
                className="employee-modal-card"
                
            >
                <CreateEmployees
                    isModal={true}
                    onClose={onClose}
                    onSuccess={onSuccess}
                />
            </div>
        </div>,
        document.body
    );
}

export default CreateEmployeeModal;