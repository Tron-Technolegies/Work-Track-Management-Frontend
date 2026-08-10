import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import UserErrorPage from "./pages/UserErrorPage";
import UserTaskDetailsPage from "./pages/UserTaskDetailsPage";
import UserProjectPage from "./pages/UserProjectPage";
import UserProjectDetailsPage from "./pages/UserProjectDetailsPage";
import UserProductivityPage from "./pages/UserProductivityPage";
import UserNotificationPage from "./pages/UserNotificationPage";
import UserSettingsPage from "./pages/UserSettingsPage";
import UserKanbanPage from "./pages/UserKanbanPage";

import LayoutUser from "./components/userlayout/LayoutUser";
import UserAuthGuard from "./auth/UserAuthGuard";
import Login from "./components/login/Login";

import { Toaster } from "react-hot-toast";
import UserProfilePage from "./pages/UserProfilePage";
import MyWorkTrackPage from "./pages/MyWorkTrackPage";
import UserApplyLeavePage from "./pages/UserApplyLeavePage";
import MyLeaveApplicationPage from "./pages/MyLeaveApplicationPage";
import LeaveLayout from "./components/leavelayout/LeaveLayout";
import LeaveBalancePage from "./pages/LeaveBalancePage";
import TaskPage from "./pages/TaskPage";
import KanbanBoardPage from "./pages/KanbanBoardPage";
import NewProjectPage from "./pages/NewProjectPage";
import Dashboard from "./pages/Dashboard";
import WorkDetailsAllPage from "./pages/WorkDetailsAllPage";
import IndividualProductivityPage from "./pages/IndividualProductivityPage";
import LeaveApprovalPage from "./pages/LeaveApprovalPage";
import ReportsPage from "./pages/ReportsPage";
import TeamsPage from "./pages/TeamsPage";
import CompanySignupPage from "./pages/CompanySignupPage";
import EmployeesPage from "./pages/EmployeesPage";
import SettingsPage from "./pages/SettingsPage";
import AttendancePage from "./pages/AttendancePage";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <CompanySignupPage />,
  },

  {
    path: "/user",
    element: (
      <UserAuthGuard>
        <LayoutUser />
      </UserAuthGuard>
    ),
    errorElement: <UserErrorPage />,
    children: [
      { index: true, element: <Dashboard/> },
      {path:"dashboard",element:<Dashboard/>},
      {path:"employees",element:<EmployeesPage/>},
      {path:"teams",element:<TeamsPage/>},
      {path:"attendance",element:<AttendancePage/>},
      {path:"workdetailsall",element:<WorkDetailsAllPage/>},
      {path: "tasks",element:<TaskPage/>},
      { path: "taskdetails/:id", element: <UserTaskDetailsPage /> },

      { path: "project", element: <UserProjectPage /> },
      { path: "projectdetails/:id", element: <UserProjectDetailsPage /> },
      {path:"newproject",element:<NewProjectPage/>},
      {path:"kanbanBoard",element:<KanbanBoardPage/>},
      { path: "productivity", element: <UserProductivityPage /> },
      {path:"individualproductivity/:id",element:<IndividualProductivityPage/>},
      {path:"reports",element:<ReportsPage/>},
      { path: "notification", element: <UserNotificationPage /> },
      { path: "setting", element: <UserSettingsPage /> },
      {path:"settings",element:<SettingsPage/>},
      {path: "profile",element:<UserProfilePage/>},
      {path: "myworktrack",element:<MyWorkTrackPage/>},
      {
        path: "leave",
        element:<LeaveLayout/>,
        children:[
          {
            index:true,
            element: <Navigate to="apply_leave" replace />
          },
          {
            path:"apply_leave",
            element:<UserApplyLeavePage/>
          },
          {
            path:"leave_application",
            element:<MyLeaveApplicationPage/>
          },
          {
            path:"leave_balance",
            element:<LeaveBalancePage/>
          },
          {
            path:"leave_approval",
            element:<LeaveApprovalPage/>
          }

        ]
      }
    ],
  },

  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '16px 24px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '15px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          },
          success: {
            style: {
              border: '1.5px solid rgba(139, 92, 246, 0.6)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), inset 0 0 10px rgba(139, 92, 246, 0.2)',
            },
            iconTheme: {
              primary: '#e879f9',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              border: '1.5px solid rgba(239, 68, 68, 0.6)',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.3), inset 0 0 10px rgba(239, 68, 68, 0.2)',
            },
            iconTheme: {
              primary: '#f87171',
              secondary: '#fff',
            },
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
