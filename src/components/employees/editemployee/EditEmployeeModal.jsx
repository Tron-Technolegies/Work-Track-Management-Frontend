import { createPortal } from "react-dom";
import "../createemployees/CreateEmployees.css";
import EditEmployee from "./EditEmployee";

function EditEmployeeModal({
    isOpen,
    onClose,
    user,
    onSuccess
}) {

    if (!isOpen) return null;

    return createPortal(
        <div className="employee-modal-overlay">
            <div className="employee-modal-card">
                <EditEmployee
                    user={user}
                    onClose={onClose}
                    onSuccess={onSuccess}
                />
            </div>
        </div>,
        document.body
    );
}

export default EditEmployeeModal;