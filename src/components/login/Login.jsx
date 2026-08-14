import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import "./Login.css";
import { toast } from "react-toastify";


const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // Clear old session
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id");

      const res = await api.post(
        "/admin_app/login/",
        {
          email,
          password,
        },
        { skipAuth: true }
      );

      const userObj = res.data.user || {};
      const userRole = res.data.role || userObj.role;

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("user_role", userRole || "");
      localStorage.setItem("user_id", userObj.id);

      toast.success("Login successful");

      if (["admin", "project_lead", "user"].includes(userRole)) {
        navigate("/user/dashboard", { replace: true });
      } else {
        toast.error("Unknown user role");
        navigate("/", { replace: true });
      }

    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Invalid email or password.";

      toast.error(msg);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="signupmain">
      <div className="signupcontainer">

    <div className="signup-left-section">

        <img
            src="/Component 180.png"
            className="tron-logo"
            alt=""
        />

        <h1>WORK TRACK</h1>

        <p>
            Employee Monitoring & Productivity Platform
        </p>

        <ul>

            <li>✔ Employee Management</li>

            <li>✔ Project Tracking</li>

            <li>✔ Attendance & Leave</li>

            <li>✔ Productivity Reports</li>

        </ul>

    </div>

        <div className="signup-right-section">

          <div className="signup-form-card">

              <h2 className="login-title">
                  Welcome Back
              </h2>

              <p className="login-subtitle">
                  Sign in to your Work Track workspace
              </p>

              <form onSubmit={handleSubmit}>

                  <label className="signup-label">
                      Email
                  </label>

                  <input
                      type="email"
                      name="email"
                      className="signup-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                  />

                  <label className="signup-label">
                      Password
                  </label>

                  <input
                      type="password"
                      name="password"
                      className="signup-input"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                  />

                  <button
                      type="submit"
                      className="signupbutton"
                      disabled={loading}
                  >
                      {loading ? "Logging in..." : "Login"}
                  </button>

              </form>

              {/* <Link className="forgot-link">
                  Forgot Password?
              </Link> */}

              <div className="divider"></div>

              <div className="company-box">

                  <p className="company-title">
                      New Company?
                  </p>

                  <p className="company-subtitle">
                      Register your organization and start managing employees.
                  </p>

                  <Link to="/signup">
                      <button className="register-company-btn">
                          Register Company
                      </button>
                  </Link>

              </div>

            </div>

        </div>
        </div>

      </div>
    // </div>
  );
};

export default Login;
