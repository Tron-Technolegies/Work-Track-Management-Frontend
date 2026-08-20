import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TbLogout } from "react-icons/tb";
import { FaChevronDown, FaUser, FaCog, FaSearch, FaTimes, FaFolder, FaTasks, FaUsers, FaUserTie, FaCompass } from "react-icons/fa";
import api from "../../api/api.jsx";
import "./UserNavbar.css";
import UserAvatar from "../common/UserAvatar.jsx";

const ALL_PAGES = [
  { name: "Dashboard", path: "/user/dashboard" },
  { name: "My Work Track", path: "/user/myworktrack" },
  { name: "Employees", path: "/user/employees" },
  { name: "Attendance", path: "/user/attendance" },
  { name: "Teams", path: "/user/teams" },
  { name: "Projects", path: "/user/project" },
  { name: "New Project", path: "/user/newproject" },
  { name: "Tasks", path: "/user/tasks" },
  { name: "Kanban Board", path: "/user/kanbanBoard" },
  { name: "Productivity", path: "/user/productivity" },
  { name: "Reports", path: "/user/reports" },
  { name: "Work Details", path: "/user/workdetailsall" },
  { name: "Apply Leave", path: "/user/leave/apply_leave" },
  { name: "My Leave Applications", path: "/user/leave/leave_application" },
  { name: "Leave Balance", path: "/user/leave/leave_balance" },
  { name: "Leave Approval", path: "/user/leave/leave_approval" },
  { name: "Leave Types", path: "/user/leave/leave_types" },
  { name: "Notifications", path: "/user/notification" },
  { name: "Settings", path: "/user/settings" },
  { name: "Profile", path: "/user/profile" },
];

function UserNavbar() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const syncCurrentUser = async () => {
    try {
      const res = await api.get("admin_app/current_user/");
      const user = res.data || {};
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user_role", user.role || "");
      if (user.id) localStorage.setItem("user_id", user.id);
    } catch (err) {
      // Keep the last authenticated-user details visible if the refresh fails.
      console.error("Failed to refresh navbar profile:", err);
    }
  };

  useEffect(() => {
    syncCurrentUser();
    const handleProfileUpdated = (event) => {
      if (event.detail) setCurrentUser(event.detail);
      syncCurrentUser();
    };

    window.addEventListener("worktrack:profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("worktrack:profile-updated", handleProfileUpdated);
  }, []);

  const displayName = [currentUser.first_name, currentUser.last_name]
    .filter(Boolean)
    .join(" ") || currentUser.name || currentUser.username || currentUser.email || "User";
  const displayRole = {
    user: "Employee",
    employee: "Employee",
    admin: "Admin",
    super_admin: "Admin",
    project_lead: "Project Lead",
  }[currentUser.role?.toLowerCase()] || currentUser.role || "Employee";

  // Fetch employee name if on individual productivity page
  useEffect(() => {
    if (location.pathname.startsWith("/user/individualproductivity/")) {
      const parts = location.pathname.split("/");
      const empId = parts[parts.length - 1];
      if (empId) {
        api
          .get(`admin_app/employees/${empId}/productivity/`)
          .then((res) => {
            if (res.data?.user?.name) {
              setEmployeeName(res.data.user.name);
            }
          })
          .catch(() => {});
      }
    } else {
      setEmployeeName("");
    }
  }, [location.pathname]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get("admin_app/notifications/unread-count/");
        setUnreadCount(res.data?.unread_count || 0);
      } catch {
        // ignore
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Dynamic page title helper
  const getPageTitle = (path) => {
    if (path === "/user" || path === "/user/" || path.startsWith("/user/dashboard")) return "Dashboard";
    if (path.startsWith("/user/myworktrack")) return "My Work Track";
    if (path.startsWith("/user/employees")) return "Employees";
    if (path.startsWith("/user/attendance")) return "Attendance";
    if (path.startsWith("/user/teams")) return "Teams";
    if (path.startsWith("/user/projectdetails")) return "Project Details";
    if (path.startsWith("/user/newproject")) return "New Project";
    if (path.startsWith("/user/project")) return "Projects";
    if (path.startsWith("/user/taskdetails")) return "Task Details";
    if (path.startsWith("/user/tasks")) return "Tasks";
    if (path.startsWith("/user/kanbanBoard")) return "Kanban Board";
    if (path.startsWith("/user/individualproductivity")) {
      return employeeName ? `${employeeName} Productivity` : "Productivity";
    }
    if (path.startsWith("/user/productivity")) return "Productivity";
    if (path.startsWith("/user/reports")) return "Reports";
    if (path.startsWith("/user/workdetailsall")) return "Work Details";
    if (path.startsWith("/user/leave/apply_leave")) return "Apply Leave";
    if (path.startsWith("/user/leave/leave_application")) return "My Leave Applications";
    if (path.startsWith("/user/leave/leave_balance")) return "Leave Balance";
    if (path.startsWith("/user/leave/leave_approval")) return "Leave Approval";
    if (path.startsWith("/user/leave/leave_types")) return "Leave Types";
    if (path.startsWith("/user/leave")) return "Leave";
    if (path.startsWith("/user/notification")) return "Notifications";
    if (path.startsWith("/user/settings") || path.startsWith("/user/setting")) return "Settings";
    if (path.startsWith("/user/profile")) return "Profile";

    return "Dashboard";
  };

  const activeTitle = getPageTitle(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("admin_app/global-search/", {
          params: { q: trimmed },
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const matchingPages = searchQuery.trim()
    ? ALL_PAGES.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSelectResult = (path) => {
    setSearchQuery("");
    setSearchOpen(false);
    navigate(path);
  };

  const hasResults =
    matchingPages.length > 0 ||
    (searchResults &&
      ((searchResults.employees && searchResults.employees.length > 0) ||
        (searchResults.projects && searchResults.projects.length > 0) ||
        (searchResults.tasks && searchResults.tasks.length > 0) ||
        (searchResults.teams && searchResults.teams.length > 0)));

  return (
    <header className="user-navbar">
      <div className="main-logo">
        <div>
          <img src="/Logos/TRONLOGO 1.png" alt="Logo" onError={(e) => { e.target.style.display = "none"; }} />
        </div>
        <div>
          <img src="/Logos/TRONacademy 1.png" alt="Logo" onError={(e) => { e.target.style.display = "none"; }} />
        </div>
      </div>

      <div className="main-nav">
        {/* Dynamic active page title */}
        <div className="nav-title-container">
          <h3 className="nav-title">{activeTitle}</h3>
        </div>

        {/* Global Search Bar */}
        <div className="nav-search-container" ref={searchRef}>
          <div className={`nav-search-input-wrapper ${searchOpen ? "active" : ""}`}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search tasks, projects, employees, pages..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && searchQuery.trim() !== "" && (
            <div className="search-dropdown-results">
              {isSearching ? (
                <div className="search-loading">Searching...</div>
              ) : !hasResults ? (
                <div className="search-no-results">No matches found for "{searchQuery}"</div>
              ) : (
                <div className="search-results-content">
                  {/* Pages Section */}
                  {matchingPages.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-header">
                        <FaCompass className="section-icon" /> Pages
                      </div>
                      {matchingPages.map((page) => (
                        <div
                          key={page.path}
                          className="search-result-item"
                          onClick={() => handleSelectResult(page.path)}
                        >
                          <span className="item-title">{page.name}</span>
                          <span className="item-badge page-badge">Page</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Employees Section */}
                  {searchResults?.employees?.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-header">
                        <FaUserTie className="section-icon" /> Employees
                      </div>
                      {searchResults.employees.map((emp) => (
                        <div
                          key={emp.id}
                          className="search-result-item"
                          onClick={() => handleSelectResult(`/user/individualproductivity/${emp.id}`)}
                        >
                          <div className="emp-item-left">
                            <UserAvatar
                              src={emp.profile_picture}
                              alt={emp.name}
                              className="search-emp-avatar"
                            />
                            <div>
                              <div className="item-title">{emp.name}</div>
                              <div className="item-sub">{emp.email}</div>
                            </div>
                          </div>
                          <span className="item-badge emp-badge">
                            {emp.role?.toLowerCase() === "project_lead"
                              ? "Project Lead"
                              : emp.role?.toLowerCase() === "admin" || emp.role?.toLowerCase() === "super_admin"
                              ? "Admin"
                              : "Employee"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects Section */}
                  {searchResults?.projects?.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-header">
                        <FaFolder className="section-icon" /> Projects
                      </div>
                      {searchResults.projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="search-result-item"
                          onClick={() => handleSelectResult(`/user/projectdetails/${proj.id}`)}
                        >
                          <div>
                            <div className="item-title">{proj.name}</div>
                            <div className="item-sub">Priority: {proj.priority}</div>
                          </div>
                          <span className={`item-badge status-${proj.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                            {proj.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tasks Section */}
                  {searchResults?.tasks?.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-header">
                        <FaTasks className="section-icon" /> Tasks
                      </div>
                      {searchResults.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="search-result-item"
                          onClick={() => handleSelectResult(`/user/taskdetails/${task.id}`)}
                        >
                          <div>
                            <div className="item-title">{task.name}</div>
                            <div className="item-sub">Priority: {task.priority}</div>
                          </div>
                          <span className={`item-badge status-${task.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Teams Section */}
                  {searchResults?.teams?.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-header">
                        <FaUsers className="section-icon" /> Teams
                      </div>
                      {searchResults.teams.map((team) => (
                        <div
                          key={team.id}
                          className="search-result-item"
                          onClick={() => handleSelectResult("/user/teams")}
                        >
                          <span className="item-title">{team.name}</span>
                          <span className="item-badge team-badge">{team.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side notification & profile */}
        <div className="nav-right">
          <div className="nav-notification" onClick={() => navigate("/user/notification")} title="Notifications">
            <img src="/Logos/carbon_notification.png" alt="Notification" onError={(e) => { e.target.style.display = "none"; }} />
            {unreadCount > 0 && (
              <span className="nav-notif-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <div className="nav-profile">
            <div className="profile-dropdown" ref={dropdownRef} onClick={() => setOpen(!open)}>
              <UserAvatar
                src={currentUser.profile_picture}
                alt={`${displayName}'s profile`}
                className="profile-img"
              />
              <div className="profile-summary">
                <span className="profile-name">{displayName}</span>
                <span className="profile-role">{displayRole}</span>
              </div>
              <FaChevronDown className="dropdown-icon" />
              {open && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => navigate("/user/profile")}>
                    <FaUser />
                    <span>Profile</span>
                  </div>

                  {/* <div className="dropdown-item" onClick={() => navigate("/user/settings")}>
                    <FaCog />
                    <span>Settings</span>
                  </div> */}
                  <div className="dropdown-item logout" onClick={handleLogout}>
                    <TbLogout />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default UserNavbar;
