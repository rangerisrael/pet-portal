import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  Calendar,
  CreditCard,
  Stethoscope,
  Clock,
  ExternalLink,
  Archive,
  Settings,
} from "lucide-react";
import {
  getUserNotifications,
  markNotificationRead,
  getUnreadNotificationCount,
  getRecentAuditActivities,
} from "../utils/auditLogger";

const NotificationCenter = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("notifications"); // 'notifications' or 'audit'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadAuditLogs();
      loadUnreadCount();

      // Set up real-time updates
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getUserNotifications(user?.id, 20, 0);
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await getRecentAuditActivities(15, user?.id);
      setAuditLogs(data);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount(user?.id);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const success = await markNotificationRead(notificationId);
      if (success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, read_at: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read_at) {
      handleMarkAsRead(notification.id);
    }

    if (notification.action_url) {
      window.location.hash = notification.action_url.replace(
        "/dashboard/owner",
        ""
      );
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment_reminder":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case "vaccination_due":
        return <Stethoscope className="w-5 h-5 text-green-500" />;
      case "payment_overdue":
      case "invoice_generated":
      case "payment_received":
        return <CreditCard className="w-5 h-5 text-orange-500" />;
      case "system_alert":
      case "audit_alert":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAuditIcon = (action, entityType) => {
    if (action === "CREATE")
      return <span className="w-3 h-3 bg-green-500 rounded-full" />;
    if (action === "UPDATE")
      return <span className="w-3 h-3 bg-blue-500 rounded-full" />;
    if (action === "DELETE")
      return <span className="w-3 h-3 bg-red-500 rounded-full" />;
    if (action === "LOGIN")
      return <span className="w-3 h-3 bg-purple-500 rounded-full" />;
    return <span className="w-3 h-3 bg-gray-400 rounded-full" />;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "normal":
        return "border-l-blue-500 bg-blue-50";
      case "low":
        return "border-l-gray-500 bg-gray-50";
      default:
        return "border-l-gray-300 bg-white";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-xl border border-gray-100  max-h-[70vh] overflow-hidden z-999!">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Activity Center
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex mt-3 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "notifications"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "audit"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Recent Activity
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === "notifications" ? (
              <div className="p-2">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 rounded-xl mb-2 border-l-4 cursor-pointer transition-all hover:shadow-md ${
                        notification.read_at
                          ? "bg-gray-50"
                          : getPriorityColor(notification.priority)
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${
                                notification.read_at
                                  ? "text-gray-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-400">
                                {formatTime(notification.created_at)}
                              </span>
                              {!notification.read_at && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-green-600 rounded"
                                  title="Mark as read"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p
                            className={`text-sm ${
                              notification.read_at
                                ? "text-gray-500"
                                : "text-gray-700"
                            } mt-1`}
                          >
                            {notification.message}
                          </p>
                          {notification.action_url && (
                            <div className="flex items-center mt-2 text-xs text-orange-600">
                              <ExternalLink size={12} className="mr-1" />
                              Click to view details
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-2">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Archive className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl mb-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-2">
                          {getAuditIcon(log.action, log.entity_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {log.action.toLowerCase()}{" "}
                              {log.entity_type.replace("_", " ")}
                            </p>
                            <span className="text-xs text-gray-400">
                              {log.time_ago}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {log.changes_summary}
                          </p>
                          {log.display_name && (
                            <p className="text-xs text-gray-500 mt-1">
                              {log.display_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  loadNotifications();
                  loadAuditLogs();
                  loadUnreadCount();
                }}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Refresh
              </button>
              <button
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                title="Notification Settings"
              >
                <Settings size={14} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
