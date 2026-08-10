import React, { useEffect, useState } from "react";
import "./CompanySettings.css";
import api from "../../../api/api.jsx";
import { FiUploadCloud } from "react-icons/fi";
import { toast } from "react-toastify";

function CompanySettings() {
  const [company, setCompany] = useState({
    company_name: "",
    company_code: "",
    email: "",
    phone: "",
    address: "",
    logo: null,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("admin_app/company/info/")
      .then((res) => {
        setCompany({
          ...res.data,
          logo: res.data.logo_url || null,
        });
      })
      .catch(() => {
        toast.error("Failed to load company settings.");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      setCompany({
        ...company,
        logo: files[0],
      });
    } else {
      setCompany({
        ...company,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("company_name", company.company_name);
      payload.append("email", company.email || "");
      payload.append("phone", company.phone);
      payload.append("address", company.address);
      if (company.logo instanceof File) {
        payload.append("logo", company.logo);
      }
      await api.put("admin_app/company/info/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Company settings saved successfully!");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save company settings.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="company-settings-page">

      <form
        className="company-settings-card"
        onSubmit={handleSubmit}
      >

        <h2>Company Settings</h2>

        <p className="company-subtitle">
          Manage your company information and branding.
        </p>

        <hr />

        {/* Logo */}

        <div className="company-logo-section">

          <div className="company-logo-preview">

            {company.logo ? (
              <img
                src={
                  typeof company.logo === "string"
                    ? company.logo
                    : URL.createObjectURL(company.logo)
                }
                alt=""
              />
            ) : (
              "Logo"
            )}

          </div>

          <label className="company-upload-btn">

            <FiUploadCloud />

            Upload Logo

            <input
              hidden
              type="file"
              name="logo"
              onChange={handleChange}
            />

          </label>

        </div>

        {/* Company Name */}

        <div className="company-form-group">

          <label>Company Name</label>

          <input
            type="text"
            name="company_name"
            value={company.company_name}
            onChange={handleChange}
          />

        </div>

        {/* Company Code */}

        <div className="company-form-group">

          <label>Company Code</label>

          <input
            type="text"
            value={company.company_code}
            readOnly
          />

          <small>
            Company code is automatically generated.
          </small>

        </div>

        {/* Email */}

        <div className="company-form-group">

          <label>Company Email</label>

          <input
            type="email"
            name="email"
            value={company.email}
            onChange={handleChange}
          />

        </div>

        {/* Phone */}

        <div className="company-form-group">

          <label>Phone Number</label>

          <input
            type="text"
            name="phone"
            value={company.phone}
            onChange={handleChange}
          />

        </div>

        {/* Address */}

        <div className="company-form-group">

          <label>Company Address</label>

          <textarea
            rows="4"
            name="address"
            value={company.address}
            onChange={handleChange}
          />

        </div>

        <div className="company-buttons">

          <button
            type="button"
            className="company-cancel-btn"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="company-save-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default CompanySettings;