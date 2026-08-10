import React from "react";
import "./AttendanceCorrections.css";
import { FiPlus } from "react-icons/fi";

const AttendanceCorrections = ({
  corrections = [],
  isAdmin,
  onOpenCorrection,
  onCorrectionAction,
  isCorrectionModalOpen,
  setIsCorrectionModalOpen,
  correctionForm,
  setCorrectionForm,
  onSubmitCorrection
}) => {
  return (
    <div className="att-corrections-container">
      <div className="att-panel-header">
        <h3>Attendance Corrections</h3>
        <button
          className="att-btn-apply"
          style={{ padding: "8px 18px", fontSize: "14px", display: "flex", gap: "6px", alignItems: "center" }}
          onClick={() => onOpenCorrection && onOpenCorrection(null)}
        >
          <FiPlus size={16} /> Request Correction
        </button>
      </div>

      <div className="att-corrections-list">
        {corrections.length === 0 ? (
          <div className="att-empty-corrections">
            No attendance correction requests submitted
          </div>
        ) : (
          corrections.map((corr) => (
            <div key={corr.id} className="att-corr-card">
              <div className="att-corr-left">
                <div className="att-corr-title">{corr.employee_name}</div>
                <div className="att-corr-sub">
                  {corr.work_date} · {corr.reason}
                </div>
              </div>

              <div className="att-corr-right">
                {corr.status === "pending" ? (
                  isAdmin ? (
                    <div className="att-corr-actions">
                      <button
                        className="att-btn-approve"
                        onClick={() => onCorrectionAction && onCorrectionAction(corr.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="att-btn-reject"
                        onClick={() => onCorrectionAction && onCorrectionAction(corr.id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="att-status-badge status-pending">Pending</span>
                  )
                ) : (
                  <span className={`att-status-badge status-${corr.status.toLowerCase()}`}>
                    {corr.status.charAt(0).toUpperCase() + corr.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= CORRECTION REQUEST MODAL ================= */}
      {isCorrectionModalOpen && (
        <div className="att-modal-overlay">
          <div className="att-modal-card">
            <div className="att-modal-header">
              <h4>Request Attendance Correction</h4>
              <button
                className="att-modal-close"
                onClick={() => setIsCorrectionModalOpen && setIsCorrectionModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={onSubmitCorrection} className="att-modal-body">
              <div className="att-form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="att-modal-input"
                  value={correctionForm.work_date}
                  onChange={(e) =>
                    setCorrectionForm &&
                    setCorrectionForm({ ...correctionForm, work_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="att-form-row">
                <div className="att-form-group">
                  <label>Check In Time</label>
                  <input
                    type="time"
                    className="att-modal-input"
                    value={correctionForm.check_in}
                    onChange={(e) =>
                      setCorrectionForm &&
                      setCorrectionForm({ ...correctionForm, check_in: e.target.value })
                    }
                  />
                </div>
                <div className="att-form-group">
                  <label>Check Out Time</label>
                  <input
                    type="time"
                    className="att-modal-input"
                    value={correctionForm.check_out}
                    onChange={(e) =>
                      setCorrectionForm &&
                      setCorrectionForm({ ...correctionForm, check_out: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="att-form-group">
                <label>Reason / Note</label>
                <textarea
                  className="att-modal-textarea"
                  rows="3"
                  placeholder="e.g. Device offline, Missed punch out, GPS verified..."
                  value={correctionForm.reason}
                  onChange={(e) =>
                    setCorrectionForm &&
                    setCorrectionForm({ ...correctionForm, reason: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div className="att-modal-footer">
                <button
                  type="button"
                  className="att-btn-cancel"
                  onClick={() => setIsCorrectionModalOpen && setIsCorrectionModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="att-btn-apply">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCorrections;
