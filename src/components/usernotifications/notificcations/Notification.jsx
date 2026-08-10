import React, { useEffect, useState } from "react";
import "./Notification.css";
import api from "../../../api/api.jsx";
import { FiCheckCircle, FiBell, FiPlusCircle, FiXCircle, FiInfo, FiTrash2, FiCheck } from "react-icons/fi";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "unread", "read"

  const fetchNotifications = async () => {
    try {
      const res = await api.get("admin_app/notifications/");
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getIcon = (message) => {
    const msg = (message || "").toLowerCase();
    if (msg.includes("assigned")) return <FiPlusCircle className="notif-type-icon assignment" />;
    if (msg.includes("completed") || msg.includes("done")) return <FiCheckCircle className="notif-type-icon success" />;
    if (msg.includes("error") || msg.includes("failed")) return <FiXCircle className="notif-type-icon error" />;
    return <FiInfo className="notif-type-icon info" />;
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await api.put("admin_app/notifications/read-all/");
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
      fetchNotifications();
    }
  };

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await api.put(`admin_app/notifications/${id}/read/`);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
      fetchNotifications();
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.delete(`admin_app/notifications/${id}/`);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount = notifications.filter((n) => n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  return (
    <div className="notification-page-container">
      {/* Header Section */}
      <div className="notification-header-section">
        <div className="header-info">
          <h2 className="notification-main-title">
            Notifications
            {unreadCount > 0 && (
              <span className="title-unread-badge">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className="header-subtitle">Real-time updates, task assignments, and activity logs</p>
        </div>

        <div className="notification-actions">
          {unreadCount > 0 && (
            <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
              <FiCheck size={16} /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="notification-filter-tabs">
        <button
          className={`filter-tab-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-tab-btn ${filter === "unread" ? "active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-tab-btn ${filter === "read" ? "active" : ""}`}
          onClick={() => setFilter("read")}
        >
          Read ({readCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="notification-list-container">
        {loading ? (
          <div className="no-notifications-card">
            <p style={{ color: "#94a3b8" }}>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => {
            return (
              <div
                key={notif.id}
                className={`notification-item-card ${!notif.is_read ? "unread" : ""}`}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                title={!notif.is_read ? "Click to mark as read" : ""}
              >
                <div className="notif-icon-wrapper">{getIcon(notif.message)}</div>

                <div className="notif-body">
                  <p className="notif-message-text">{notif.message}</p>
                  <span className="notif-timestamp">{timeAgo(notif.created_at)}</span>
                </div>

                <div className="notif-right-actions">
                  {!notif.is_read && <span className="unread-dot" title="Unread"></span>}
                  <button
                    className="delete-notif-btn"
                    onClick={(e) => handleDelete(notif.id, e)}
                    title="Delete notification"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-notifications-card">
            <FiBell className="empty-bell-icon" />
            <p>No {filter !== "all" ? filter : ""} notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
