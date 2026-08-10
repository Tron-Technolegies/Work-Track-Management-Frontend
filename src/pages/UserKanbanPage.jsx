import React from 'react'
import UserKanban from '../components/userkanban/UserKanban'
import "./UserKanbanPage.css";

const UserKanbanPage = () => {
    return (
        <div className="kanban-page-container animate-fade-in-long">
            <div className="kanban-content-area animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <UserKanban />
            </div>
        </div>
    )
}

export default UserKanbanPage
