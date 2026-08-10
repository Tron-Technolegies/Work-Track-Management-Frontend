import React, { useEffect } from "react";
import "../tasks/newTask/NewTaskModal.css"; // Reuse the standard modal styling
import Signup from "./Signup";
import { FiX } from "react-icons/fi";

const SignupModal = ({ isOpen, onClose, onSuccess }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target.className === "modal-overlay") {
            onClose();
        }
    };

    const handleSuccess = () => {
        onSuccess && onSuccess();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content animate-slide-up" style={{ maxWidth: '950px' }}>
                <div className="modal-body" style={{ padding: 0 }}>
                    <Signup isModal={true} onClose={onClose} onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    );
};

export default SignupModal;
