import React, { useState, useEffect } from "react";
import api from "../../api/api";
import UserKanbanDnd from "./UserKanbanDnd";
import "./UserKanban.css";

const UserKanban = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const res = await api.get("/admin_app/kanban/tasks/");
                setTasks(res.data);
            } catch (err) {
                console.error("Error fetching kanban tasks:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    return (
        <div className="kanban-wrapper-main animate-fade-in-long">
            <div className="kanban-top">
                <div className="kanban-header-left">
                    <h2 className="kanban-title-text">My Kanban Board</h2>
                    <p className="kanban-subtitle">Manage and track your task progress visually</p>
                </div>
            </div>

            {loading ? (
                <div className="kanban-loading">
                    <div className="loader"></div>
                    <p>Loading your tasks...</p>
                </div>
            ) : (
                <div className="kanban-content">
                    <UserKanbanDnd tasks={tasks} />
                </div>
            )}
        </div>
    );
};

export default UserKanban;
