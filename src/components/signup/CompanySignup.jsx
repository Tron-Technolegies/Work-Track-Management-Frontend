import React, { useState } from "react";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import api from "../../api/api";
import { toast } from "react-toastify";

const CompanySignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company_name: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const passwordRules = {
    minLength: formData.password.length >= 8,
    upperCase: /[A-Z]/.test(formData.password),
    lowerCase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const mobileRules = {
    validLength: /^\d{10}$/.test(formData.phone),
    validStart: /^[6-9]/.test(formData.phone),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { company_name, name, email, phone, password } = formData;

    if (!company_name || !name || !email || !phone || !password) {
      toast.error("Please fill all required fields");
      return;
    }

    setShowPasswordValidation(true);

    const isPasswordValid =
      passwordRules.minLength &&
      passwordRules.upperCase &&
      passwordRules.lowerCase &&
      passwordRules.number &&
      passwordRules.special;

    if (!isPasswordValid) {
      toast.error("Password does not meet complexity requirements");
      return;
    }

    if (!mobileRules.validLength || !mobileRules.validStart) {
      toast.error("Please enter a valid 10-digit mobile number starting with 6-9");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Register Company & Admin user
      const signupRes = await api.post("/admin_app/signup/", formData);
      toast.success(signupRes.data?.message || "Company registered successfully!");

      // Step 2: Auto Login Admin
      const loginRes = await api.post("/admin_app/login/", {
        email: formData.email,
        password: formData.password,
      });

      const userRole = loginRes.data.role || loginRes.data.user?.role;
      const userId = loginRes.data.id || loginRes.data.user?.id;

      localStorage.setItem("access", loginRes.data.access);
      localStorage.setItem("refresh", loginRes.data.refresh);
      localStorage.setItem("user_role", userRole);
      localStorage.setItem("user_id", userId);
      localStorage.setItem("user", JSON.stringify(loginRes.data.user));

      toast.success("Welcome! Starting onboarding workflow...");
      navigate("/user/dashboard");

    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Company signup failed. Please check inputs.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signupmain">
      <div className="signupcontainer">
        <div className="signup-left-section">
          <div className="signup-logo-box">
            <img className="tron-logo" src="/Component 180.png" alt="Tron Logo" />
            <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '800', margin: '0', letterSpacing: '2px', fontFamily: "'Outfit', sans-serif" }}>
              WORK TRACK
            </h1>
            <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '8px 0 0 0', opacity: '0.9', fontFamily: "'Outfit', sans-serif" }}>
              Register Company & Start Onboarding
            </p>
          </div>
        </div>

        <div className="signup-right-section">
          <div className="signup-form-card" style={{ padding: "40px 50px" }}>
            <div className="signup-login-and-signup">
              <p className="signupname">Company Signup</p>
              <Link to="/">
                <p className="inactive">Login</p>
              </Link>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Company Name */}
              <div className="signup-field" style={{ marginBottom: "16px" }}>
                <label className="signup-label">Company Name *</label>
                <input
                  name="company_name"
                  type="text"
                  className="signup-input"
                  placeholder="e.g. Acme Corporation"
                  value={formData.company_name}
                  onChange={handleChange}
                  style={{ marginBottom: "0" }}
                  required
                />
              </div>

              {/* Admin Name */}
              <div className="signup-field" style={{ marginBottom: "16px" }}>
                <label className="signup-label">Admin Full Name *</label>
                <input
                  name="name"
                  type="text"
                  className="signup-input"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ marginBottom: "0" }}
                  required
                />
              </div>

              {/* Email */}
              <div className="signup-field" style={{ marginBottom: "16px" }}>
                <label className="signup-label">Admin Email Address *</label>
                <input
                  name="email"
                  type="email"
                  className="signup-input"
                  placeholder="admin@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ marginBottom: "0" }}
                  required
                />
              </div>

              {/* Phone */}
              <div className="signup-field" style={{ marginBottom: "16px" }}>
                <label className="signup-label">Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  className="signup-input"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ marginBottom: "0" }}
                  required
                />
              </div>
              {formData.phone && (
                <div className="mobile-rules" style={{ marginTop: "4px" }}>
                  <p className={mobileRules.validLength ? "valid" : "invalid"}>
                    {mobileRules.validLength ? "✓" : "✗"} 10 digits required
                  </p>
                  <p className={mobileRules.validStart ? "valid" : "invalid"}>
                    {mobileRules.validStart ? "✓" : "✗"} Starts with 6, 7, 8, or 9
                  </p>
                </div>
              )}

              {/* Password */}
              <div className="signup-field" style={{ marginBottom: "16px" }}>
                <label className="signup-label">Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="signup-input"
                    placeholder="Create admin password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ marginBottom: "0" }}
                    required
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#94a3b8",
                    }}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </div>
                </div>
              </div>

              {(showPasswordValidation || formData.password) && (
                <div className="password-rules" style={{ marginBottom: "16px" }}>
                  <p className={passwordRules.minLength ? "valid" : "invalid"}>
                    {passwordRules.minLength ? "✓" : "✗"} Min 8 characters
                  </p>
                  <p className={passwordRules.upperCase ? "valid" : "invalid"}>
                    {passwordRules.upperCase ? "✓" : "✗"} 1 Uppercase letter
                  </p>
                  <p className={passwordRules.lowerCase ? "valid" : "invalid"}>
                    {passwordRules.lowerCase ? "✓" : "✗"} 1 Lowercase letter
                  </p>
                  <p className={passwordRules.number ? "valid" : "invalid"}>
                    {passwordRules.number ? "✓" : "✗"} 1 Number
                  </p>
                  <p className={passwordRules.special ? "valid" : "invalid"}>
                    {passwordRules.special ? "✓" : "✗"} 1 Special character
                  </p>
                </div>
              )}

              {/* Address (Optional) */}
              <div className="signup-field" style={{ marginBottom: "20px" }}>
                <label className="signup-label">Company Address (Optional)</label>
                <input
                  name="address"
                  type="text"
                  className="signup-input"
                  placeholder="City, State, Country"
                  value={formData.address}
                  onChange={handleChange}
                  style={{ marginBottom: "0" }}
                />
              </div>

              <button className="signupbutton" type="submit" disabled={loading}>
                {loading ? "Registering Company..." : "Register Company & Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySignup;
