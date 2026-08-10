import React, { useState, useEffect } from "react";
import "./ApplyLeaveForm.css";
import { FiUploadCloud } from "react-icons/fi";
import api from "../../../../api/api";
import { toast } from "react-toastify";

const LEAVE_TYPE_LABEL_MAP = {
  casual: "Casual Leave",
  sick: "Sick Leave",
  earned: "Earned Leave",
  maternity: "Maternity Leave",
  paternity: "Paternity Leave",
  work_from_home: "Work From Home",
  half_day: "Half Day",
  comp_off: "Compensatory Off",
  loss_of_pay: "Loss of Pay",
  bereavement: "Bereavement Leave",
};

function ApplyLeaveForm() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    totalDays: "",
    reason: "",
    document: null,
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get("admin_app/leave-types/");
      setLeaveTypes(res.data || []);
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      const diffTime = end - start;
      if (diffTime >= 0) {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData((prev) => ({ ...prev, totalDays: diffDays }));
      } else {
        setFormData((prev) => ({ ...prev, totalDays: 0 }));
      }
    }
  }, [formData.fromDate, formData.toDate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "document") {
      setFormData((prev) => ({ ...prev, document: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClear = () => {
    setFormData({
      leaveType: "",
      fromDate: "",
      toDate: "",
      totalDays: "",
      reason: "",
      document: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        leave_type: parseInt(formData.leaveType, 10),
        start_date: formData.fromDate,
        end_date: formData.toDate,
        reason: formData.reason,
      };

      await api.post("user_app/leave-request/", payload);
      toast.success("Leave request submitted successfully!");
      handleClear();
      window.dispatchEvent(new Event("leave-submitted"));
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to submit leave request";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-apply-leave-page">
      <form className="leave-card" onSubmit={handleSubmit}>
        <h3 className="leave-card-title">Leave Application Form</h3>
        <hr />

        {/* Leave Type */}
        <div className="leave-form-group full">
          <label>Leave Type *</label>
          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            required
          >
            <option value="">Select Leave Type</option>
            {leaveTypes.map((type) => {
              const label = LEAVE_TYPE_LABEL_MAP[type.name] || type.name;
              return (
                <option key={type.id} value={type.id}>
                  {label} ({type.days_per_year} days/yr)
                </option>
              );
            })}
          </select>
        </div>

        {/* Dates */}
        <div className="leave-form-row three-column">
          <div className="leave-form-group">
            <label>From Date *</label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="leave-form-group">
            <label>To Date *</label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="leave-form-group">
            <label>Total Days</label>
            <input
              type="text"
              name="totalDays"
              value={formData.totalDays}
              placeholder="-"
              readOnly
            />
          </div>
        </div>

        {/* Reason */}
        <div className="leave-form-group full">
          <label>Reason for Leave *</label>
          <textarea
            rows="5"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Briefly describe the reason for your leave request..."
            required
          />
        </div>

        {/* Upload */}
        <div className="leave-form-group full">
          <label>
            Supporting Document
            <span className="leave-optional"> (optional)</span>
          </label>
          <label className="leave-upload-box">
            <FiUploadCloud className="leave-upload-icon" />
            <p>{formData.document ? formData.document.name : "Click to upload or drag & drop"}</p>
            <span>PDF, JPG, PNG up to 5MB</span>
            <input
              type="file"
              name="document"
              onChange={handleChange}
              hidden
            />
          </label>
        </div>

        <hr />

        {/* Buttons */}
        <div className="leave-button-group">
          <button type="submit" className="leave-submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>

          <button
            type="button"
            className="leave-clear-btn"
            onClick={handleClear}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}

export default ApplyLeaveForm;