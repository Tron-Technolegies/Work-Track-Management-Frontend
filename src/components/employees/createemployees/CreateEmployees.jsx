import { useEffect, useState } from "react";
import {
    FiEye,
    FiEyeOff
} from "react-icons/fi";

import api from "../../../api/api";
import { toast } from "react-toastify";

import "./CreateEmployees.css";

function CreateEmployees({
    isModal,
    onClose,
    onSuccess
}) {

    const [teams,setTeams] = useState([]);

    const [showPassword,setShowPassword] = useState(false);

    const [loading,setLoading] = useState(false);

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
                "admin_app/view-teams/"
            );

            setTeams(res.data.data || res.data);

        }catch{

            toast.error("Unable to load teams");

        }

    };

    const handleChange=(e)=>{

        const {name,value,files}=e.target;

        if(files){

            setFormData({
                ...formData,
                profile_picture:files[0]
            });

        }else{

            setFormData({
                ...formData,
                [name]:value
            });

        }

    };

    const handleSubmit=async(e)=>{

        e.preventDefault();

        if(formData.password!==formData.confirm_password){

            toast.error("Passwords do not match");

            return;

        }

        try{

            setLoading(true);

            const data=new FormData();


            data.append("first_name", formData.first_name);
            data.append("last_name", formData.last_name);
            data.append("email",formData.email);
            data.append("mobile",formData.mobile);
            data.append("password",formData.password);
            data.append("role",formData.role);

            if(formData.team){

                data.append("team",formData.team);

            }

            if(formData.profile_picture){

                data.append(
                    "profile_picture",
                    formData.profile_picture
                );

            }

            const res=await api.post(

                "admin_app/create-user/",
                data

            );

            toast.success(res.data.message);

            onSuccess();

            onClose();

        }

        catch (err) {

            console.log("Backend Error:", err.response?.data);

            toast.error(
                JSON.stringify(err.response?.data)
            );

        }

        finally{

            setLoading(false);

        }

    };

    return(

        <div className="employee-card">

            <div className="employee-header">

                <h2>Create Employee</h2>

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
                        type={
                            showPassword
                            ?"text"
                            :"password"
                        }
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <span
                        onClick={()=>
                            setShowPassword(!showPassword)
                        }
                    >
                        {
                            showPassword
                            ?<FiEyeOff/>
                            :<FiEye/>
                        }
                    </span>

                </div>

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