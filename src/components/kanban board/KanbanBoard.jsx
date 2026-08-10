import React, { useState, useEffect } from "react";
import api from "../../api/api";
import KanbanDndKit from "./KanbanDndKit";
import "./KanbanBoard.css";

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  // const [filter, setFilter] = useState("All");
  const [filter] = useState("All");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");



  const fetchTasks = async (
            user = selectedUser,
            status = selectedStatus
          ) => {
            try {

              let url =
                "/admin_app/kanban/tasks/?";

              if (user) {
                url += `user=${user}&`;
              }

              if (status !== "All") {
                url += `status=${status}`;
              }

              const res = await api.get(url);

              setTasks(res.data);

            } catch (err) {
              console.error(err);
            }
          };
      useEffect(() => {
        fetchTasks();
      }, [selectedUser, selectedStatus]);


      useEffect(() => {
      const fetchUsers = async () => {
        try {
          const res = await api.get(
            "/admin_app/users/list/"
          );

          setUsers(res.data);
        } catch (err) {
          console.error(err);
        }
      };

      fetchUsers();
    }, []);

  return (
    <div className="kanban-wrapper-main">
      <div className="kanban-top">
        <h2 className="kanban-title-text">kanban Board</h2>
          <div className="filter_user">

          <div>
            <select
              className="filter-select"
              value={selectedUser}
              onChange={(e) =>
                setSelectedUser(e.target.value)
              }
            >
              <option className="all_user" value="">
                All Users
              </option>

              {users.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.first_name}
                </option>
              ))}
            </select>
            </div>
            
            <div>
            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="To Do">
                To Do
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Completed">
                Completed
              </option>
            </select> 

            </div>
            </div>
      </div>

      <KanbanDndKit tasks={tasks} filter={filter} />
    </div>
  );
};

export default KanbanBoard;
