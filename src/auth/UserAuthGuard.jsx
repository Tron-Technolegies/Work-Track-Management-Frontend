import { Navigate } from "react-router-dom";

const UserAuthGuard = ({ children }) => {
  const access = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!access || !user) {
    return <Navigate to="/" replace />;
  }

  if (!["admin", "project_lead", "user"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default UserAuthGuard;