import React, { useState, useEffect } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import api, { getErrorMessage } from "../../api/api";
import { toast } from "react-toastify";

const Signup = ({ isModal = false, onClose, onSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    profile_picture: null,
  });

  const [loading, setLoading] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [showPasswordValidation, setShowPasswordValidation] = useState(false);


  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await api.get("admin_app/current_user/");
        if (res.data.role !== "admin") {
          toast.error("You are not authorized to create users");
          if (!isModal) navigate("/dashboard");
        }
      } catch {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
      } finally {
        setCheckingRole(false);
      }
    };

    verifyAdmin();
  }, [navigate, isModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, mobile, password } = formData;
    if (!name || !email || !mobile || !password) {
      toast.error("Please fill all fields");
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
      toast.error(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (!mobileRules.validLength) {
      toast.error("Mobile number must contain exactly 10 digits");
      return;
    }
    if (!mobileRules.validStart) {
      toast.error("Mobile number must start with 6, 7, 8, or 9");
      return;
    }


    try {
      setLoading(true);

      const submitData = new FormData();

      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("mobile", formData.mobile);
      submitData.append("password", formData.password);

      if (formData.profile_picture) {
        submitData.append(
          "profile_picture",
          formData.profile_picture
        );
      }
      console.log(formData.profile_picture);

      const res = await api.post(
        "admin_app/signup/",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(res.data?.message || "User created successfully");

      if (isModal) {
        onSuccess && onSuccess();
      } else {
        setFormData({ name: "", email: "", mobile: "", password: "" });
        navigate("/users");
      }

    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create user"));
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Wait until role is checked
  if (checkingRole) return null;
  const passwordRules = {
    minLength: formData.password.length >= 8,
    upperCase: /[A-Z]/.test(formData.password),
    lowerCase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const mobileRules = {
    validLength: /^\d{10}$/.test(formData.mobile),
    validStart: /^[6-9]/.test(formData.mobile),
  };

  return (
    <div className={isModal ? "signup-modal-body" : "signupmain"}>
      <div className="signupcontainer">
        <div className="signup-left-section">
          <div className="signup-logo-box">
            <img
              className="tron-logo"
              src="\tron...-02.png"
              alt="Tron Logo"
            />
            <h1 style={{ color: 'white', fontSize: '42px', fontWeight: '800', margin: '0', letterSpacing: '2px', fontFamily: "'Outfit', sans-serif" }}>TRON</h1>
            <p style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0', letterSpacing: '4px', opacity: '0.9', fontFamily: "'Outfit', sans-serif", fontStyle: 'italic' }}>ACADEMY</p>
          </div>
        </div>

        <div className="signup-right-section">
          <div className="signup-form-card">
            <div className="signup-login-and-signup">
              <p className="signupname">Create New User</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form" autoComplete="off">
              <div className="signup-field">
                <label className="signup-label">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  className="signup-input"
                  placeholder="Enter full name"
                  autoComplete="new-name"
                />
              </div>

              <div className="signup-field">
                <label className="signup-label">Email Address</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  className="signup-input"
                  placeholder="email@example.com"
                  autoComplete="new-email"
                />
              </div>

              <div className="signup-field">
                <label className="signup-label">Mobile Number</label>
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  type="tel"
                  className="signup-input"
                  placeholder="+1 234 567 890"
                  autoComplete="new-tel"
                />
              </div>
              {formData.mobile && (
                <div className="mobile-rules">
                  <p className={mobileRules.validLength ? "valid" : "invalid"}>
                    {mobileRules.validLength ? "✓" : "✗"} Must contain exactly 10 digits
                  </p>
                  <p className={mobileRules.validStart ? "valid" : "invalid"}>
                    {mobileRules.validStart ? "✓" : "✗"} Must start with 6, 7, 8, or 9
                  </p>
                </div>
              )}

              <div className="signup-field">
                <label className="signup-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    className="signup-input"
                    placeholder="Create a strong password"
                    style={{ marginBottom: '0' }}
                    autoComplete="new-password"
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </div>
                </div>
              </div>

              {(showPasswordValidation || formData.password) && (
                <div className="password-rules">

                  <p className={passwordRules.minLength ? "valid" : "invalid"}>
                    {passwordRules.minLength ? "✓" : "✗"} Minimum 8 characters
                  </p>

                  <p className={passwordRules.upperCase ? "valid" : "invalid"}>
                    {passwordRules.upperCase ? "✓" : "✗"} One uppercase letter
                  </p>

                  <p className={passwordRules.lowerCase ? "valid" : "invalid"}>
                    {passwordRules.lowerCase ? "✓" : "✗"} One lowercase letter
                  </p>

                  <p className={passwordRules.number ? "valid" : "invalid"}>
                    {passwordRules.number ? "✓" : "✗"} One number
                  </p>

                  <p className={passwordRules.special ? "valid" : "invalid"}>
                    {passwordRules.special ? "✓" : "✗"} One special character
                  </p>

                </div>
              )}

              <div className="signup-field">
                <label className="signup-label">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile_picture: e.target.files[0]
                    })
                  } />
              </div>



              <div className={isModal ? "modal-actions" : "signup-actions"}>
                {isModal && (
                  <button type="button" className="signup-cancel-btn" onClick={onClose} style={{
                    flex: '1',
                    padding: '16px',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#64748b',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginRight: '12px'
                  }}>
                    Cancel
                  </button>
                )}
                <button
                  className="signupbutton"
                  type="submit"
                  disabled={loading}
                  style={isModal ? { flex: '1.5', marginTop: '0' } : {}}
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Signup;
