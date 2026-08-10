import React from "react";
import { Outlet,useLocation } from "react-router-dom";
import UserSidebarPage from "../../pages/UserSidebarPage";
import "./LayoutUser.css";
import UserNavbar from "../usernavbar/UserNavbar";
import LeaveSidebar from "../leavesidebar/LeaveSidebar";


const LayoutUser = () => {
  const location = useLocation();

  const showLeaveSidebar = location.pathname.startsWith("/user/leave");
  return (
    <div className="user-layout">
      <UserNavbar />

      <div className="layout-body">
        <UserSidebarPage />

        {showLeaveSidebar && <LeaveSidebar/>}
        <main className={`user-main ${showLeaveSidebar ? 'with-leave-sidebar' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutUser;