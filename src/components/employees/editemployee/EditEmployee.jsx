import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import api from "../../../api/api";
import { toast } from "react-toastify";
// import "../createemployees/CreateEmployees.css";

function EditEmployee({
    user,
    onClose,
    onSuccess
}) {

    const [teams, setTeams] = useState([]);

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({

        first_name: "",

        last_name: "",

        email: "",

        mobile: "",

        role: "user",

        team: "",

        password: "",

        profile_picture: null

    });

    useEffect(() => {

        loadTeams();

    }, []);

    useEffect(() => {

        if (user) {

            setFormData({

                first_name: user.first_name || "",

                last_name: user.last_name || "",

                email: user.email || "",

                mobile: user.mobile || "",

                role: user.role || "user",

                team: user.team || "",

                password: "",

                profile_picture: null

            });

        }

    }, [user]);

    const loadTeams = async () => {

        try {

            const res = await api.get(
                "admin_app/view-teams/"
            );

            setTeams(res.data.data || res.data);

        } catch {

            toast.error("Unable to load teams");

        }

    };

    const handleChange = (e) => {

        const { name, value, files } = e.target;

        if (files) {

            setFormData({
                ...formData,
                profile_picture: files[0]
            });

        }

        else {

            setFormData({
                ...formData,
                [name]: value
            });

        }

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const data = new FormData();

            data.append("first_name", formData.first_name);
            data.append("last_name", formData.last_name);
            data.append("email", formData.email);
            data.append("mobile", formData.mobile);
            data.append("role", formData.role);

            if (formData.team) {

                data.append("team", formData.team);

            }

            if (formData.password) {

                data.append("password", formData.password);

            }

            if (formData.profile_picture) {

                data.append(
                    "profile_picture",
                    formData.profile_picture
                );

            }

            const res = await api.put(

                `admin_app/update_employee/${user.id}/`,

                data

            );

            toast.success(res.data.message);

            onSuccess();

            onClose();

        }

        catch (err) {

            toast.error(

                err.response?.data?.error ||

                "Unable to update employee"

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="employee-card">

            <div className="employee-header">

                <h2>Edit Employee</h2>

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
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                />

                <label>Role</label>

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >

                    <option value="user">
                        User
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

                    {teams.map(team => (

                        <option
                            key={team.id}
                            value={team.id}
                        >
                            {team.team_name}
                        </option>

                    ))}

                </select>

                <label>New Password (Optional)</label>

                <div className="password-box">

                    <input
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <span
                        onClick={() =>
                            setShowPassword(!showPassword)
                        }
                    >
                        {
                            showPassword
                                ? <FiEyeOff />
                                : <FiEye />
                        }
                    </span>

                </div>

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
                                ? "Updating..."
                                : "Update Employee"
                        }
                    </button>

                </div>

            </form>

        </div>

    );

}

export default EditEmployee;