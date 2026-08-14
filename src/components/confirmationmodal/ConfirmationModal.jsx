import React from "react";
import { FiTrash2 } from "react-icons/fi";
import "./ConfirmationModal.css";
import { createPortal } from "react-dom";

function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    loading = false,
}) {
    if (!isOpen) return null;

    return createPortal(
        <div
            className="confirmation-overlay"
            onClick={onCancel}
        >
            <div
                className="confirmation-card"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="confirmation-icon">
                    <FiTrash2 size={24} />
                </div>

                <h3>{title}</h3>

                <p>{message}</p>

                <div className="confirmation-actions">

                    <button
                        type="button"
                        className="confirmation-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="confirmation-delete"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        <FiTrash2 size={15} />
                        {loading ? "Deleting..." : "Delete"}
                    </button>

                </div>
            </div>
        </div>,
        document.body
    );
}

export default ConfirmationModal;