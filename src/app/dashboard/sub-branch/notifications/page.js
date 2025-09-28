"use client";

import React, { useState } from "react";
import {
  Bell,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  MoreVertical,
  Trash2,
  MarkEmailRead,
  MarsStroke,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import { petOwnerItems, subBranchItems } from "@/components/utils/link-data";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const NotificationsContent = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Static notification data for demonstration
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "appointment",
      title: "Upcoming Appointment",
      message:
        "You have an appointment with Dr. Smith tomorrow at 2:00 PM for Max's check-up",
      time: "2 hours ago",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      icon: Calendar,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: 2,
      type: "reminder",
      title: "Vaccination Due",
      message:
        "Max's annual vaccination is due next week. Please schedule an appointment soon.",
      time: "1 day ago",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: false,
      icon: AlertCircle,
      color: "text-orange-600 bg-orange-50",
    },
    {
      id: 3,
      type: "completed",
      title: "Lab Results Ready",
      message:
        "Lab results for Bella are now available. Blood work shows normal values.",
      time: "2 days ago",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      icon: FileText,
      color: "text-green-600 bg-green-50",
    },
    {
      id: 4,
      type: "system",
      title: "Profile Updated",
      message:
        "Your profile information has been successfully updated with new contact details.",
      time: "3 days ago",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
    {
      id: 5,
      type: "reminder",
      title: "Medication Reminder",
      message:
        "Time to give Charlie his evening medication. Don't forget the antibiotics.",
      time: "1 week ago",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      read: true,
      icon: Clock,
      color: "text-purple-600 bg-purple-50",
    },
    {
      id: 6,
      type: "appointment",
      title: "Appointment Confirmed",
      message:
        "Your appointment for Luna's dental cleaning has been confirmed for next Friday.",
      time: "1 week ago",
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      read: true,
      icon: Calendar,
      color: "text-blue-600 bg-blue-50",
    },
  ]);

  const notificationTypes = [
    { value: "all", label: "All" },
    { value: "appointment", label: "Appointments" },
    { value: "reminder", label: "Reminders" },
    { value: "completed", label: "Completed" },
    { value: "system", label: "System" },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" || notification.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
    setSelectedNotifications((prev) =>
      prev.filter((id) => id !== notificationId)
    );
  };

  const deleteSelectedNotifications = () => {
    setNotifications((prev) =>
      prev.filter(
        (notification) => !selectedNotifications.includes(notification.id)
      )
    );
    setSelectedNotifications([]);
  };

  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Bell size={24} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your notifications and stay updated
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <MarsStroke size={16} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
            >
              {notificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedNotifications.length} notification(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  selectedNotifications.forEach((id) => markAsRead(id));
                  setSelectedNotifications([]);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded"
              >
                Mark as read
              </button>
              <button
                onClick={deleteSelectedNotifications}
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded flex items-center space-x-1"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <>
            {/* Select All Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedNotifications.length ===
                      filteredNotifications.length &&
                    filteredNotifications.length > 0
                  }
                  onChange={selectAllNotifications}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-600">
                  Select all notifications
                </span>
              </label>
            </div>

            {/* Notification Items */}
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const IconComponent = notification.icon;
                const isSelected = selectedNotifications.includes(
                  notification.id
                );

                return (
                  <div
                    key={notification.id}
                    className={`px-4 py-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? "bg-blue-50/30" : ""
                    } ${isSelected ? "bg-blue-100" : ""}`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleSelectNotification(notification.id)
                        }
                        className="mt-1 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                      />

                      {/* Icon */}
                      <div
                        className={`p-2 rounded-full ${notification.color} flex-shrink-0`}
                      >
                        <IconComponent size={16} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3
                                className={`text-sm font-medium ${
                                  !notification.read
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.time}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-orange-600 hover:text-orange-700 px-2 py-1 rounded"
                                title="Mark as read"
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="text-gray-400 hover:text-red-600 p-1 rounded"
                              title="Delete notification"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="px-4 py-12 text-center">
            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You're all caught up! No new notifications."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("notifications");

  return (
    <ProtectedRoute requiredRole="pet-owner">
      <DashboardMainLayout
        navList={subBranchItems}
        selectedPageRender={<NotificationsContent />}
        role="sub-branch"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </ProtectedRoute>
  );
};

export default NotificationsPage;
