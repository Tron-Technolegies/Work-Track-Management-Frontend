import React from "react";
import { FiLock } from "react-icons/fi";
import "./PermissionDeniedBanner.css";

/**
 * PermissionDeniedBanner
 * Displays a styled, clear access-denied message.
 * 
 * Props:
 *   message  (string)  – Custom message override. Defaults to standard text.
 *   compact  (bool)    – If true, renders a compact inline badge instead of a full panel.
 */
function PermissionDeniedBanner({ message, compact = false }) {
  const defaultMessage =
    "You do not have permission to access this functionality.";

  if (compact) {
    return (
      <span className="pdb-compact">
        <FiLock size={13} />
        {message || "Access restricted"}
      </span>
    );
  }

  return (
    <div className="pdb-panel">
      <div className="pdb-icon-wrap">
        <FiLock size={32} />
      </div>
      <h3 className="pdb-title">Access Restricted</h3>
      <p className="pdb-message">{message || defaultMessage}</p>
    </div>
  );
}

export default PermissionDeniedBanner;
