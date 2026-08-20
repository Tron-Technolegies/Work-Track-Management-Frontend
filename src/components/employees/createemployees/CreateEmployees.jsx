import { useEffect, useState } from "react";
import {
    FiEye,
    FiEyeOff
} from "react-icons/fi";

import api, { getErrorMessage } from "../../../api/api";
import { toast } from "react-toastify";

import "./CreateEmployees.css";
import { FiX } from "react-icons/fi";

function CreateEmployees({
    isModal,
    onClose,
    onSuccess
}) {

    const [teams,setTeams] = useState([]);

    const [showPassword,setShowPassword] = useState(false);

    const [loading,setLoading] = useState(false);
    const [showPasswordValidation, setShowPasswordValidation] = useState(false);
    const [formData,setFormData] = useState({

        first_name:"",
        last_name:"",
        email:"",
        mobile:"",
        role:"user",
        team:"",
        password:"",
        confirm_password:"",
        profile_picture:null

    });

    useEffect(()=>{

        loadTeams();

    },[]);

    const loadTeams = async()=>{

        try{

            const res = await api.get(
                "admin_app/active-teams/"
            );

            setTeams(res.data.data || res.data);

        }catch{

            toast.error("Unable to load teams");

        }

    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            setFormData((prev) => ({
                ...prev,
                profile_picture: files[0],
            }));
            return;
        }

        if (name === "mobile") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

            setFormData((prev) => ({
                ...prev,
                mobile: digitsOnly,
            }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
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

   const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name.trim()) {
        toast.error("First name is required");
        return;
    }

    if (!formData.last_name.trim()) {
        toast.error("Last name is required");
        return;
    }

    if (!formData.email.trim()) {
        toast.error("Email address is required");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        toast.error("Please enter a valid email address");
        return;
    }

    if (!formData.mobile) {
        toast.error("Mobile number is required");
        return;
    }

    if (!mobileRules.validLength || !mobileRules.validStart) {
        toast.error("Mobile number must be a valid 10-digit number starting with 6, 7, 8, or 9");
        return;
    }

    if (!formData.password) {
        toast.error("Password is required");
        return;
    }

    if (formData.password !== formData.confirm_password) {
        toast.error("Passwords do not match");
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

    try {
        setLoading(true);

        const data = new FormData();

        data.append("first_name", formData.first_name.trim());
        data.append("last_name", formData.last_name.trim());
        data.append("email", formData.email.trim());
        data.append("mobile", formData.mobile);
        data.append("password", formData.password);
        data.append("role", formData.role);

        if (formData.team) {
            data.append("team", formData.team);
        }

        if (formData.profile_picture) {
            data.append(
                "profile_picture",
                formData.profile_picture
            );
        }

        const res = await api.post(
            "admin_app/create-user/",
            data
        );

        toast.success(
            res.data?.message || "Employee created successfully"
        );

        onSuccess && onSuccess();
        onClose && onClose();

    } catch (err) {
        console.log("Backend Error:", err.response?.data);
        toast.error(getErrorMessage(err, "Failed to create employee"));

    } finally {
        setLoading(false);
    }
};

    return(

        <div className="employee-card">

            <div className="employee-header">

                <h2>Create Employee</h2>
                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <FiX />
                    </button>

            </div>

            <form
                onSubmit={handleSubmit}
                className="employee-form"
            >

                <div className="employee-grid">

                    <div>

                        <label>First Name</label>

                        <input
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                        />

                    </div>

                    <div>

                        <label>Last Name</label>

                        <input
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                <label>Email</label>

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />

            <label>Mobile</label>

            <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
            />

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

                <label>Role</label>

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="user">
                        Employee
                    </option>

                    <option value="project_lead">
                        Project Lead
                    </option>

                </select>

                <label>Team</label>

                <select
                    name="team"
                    value={formData.team}
                    onChange={handleChange}
                >

                    <option value="">
                        Select Team
                    </option>

                    {teams.map(team=>(

                        <option
                            key={team.id}
                            value={team.id}
                        >
                            {team.team_name}
                        </option>

                    ))}

                </select>

            <label>Password</label>

            <div className="password-box">

                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <span
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>

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



                <label>Confirm Password</label>

                <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                />

                <label>Profile Picture</label>

                <input
                    type="file"
                    onChange={handleChange}
                />

                <div className="employee-actions">

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="create-btn"
                    >
                        {
                            loading
                            ?"Creating..."
                            :"Create Employee"
                        }
                    </button>

                </div>

            </form>

        </div>

    );

}

export default CreateEmployees;