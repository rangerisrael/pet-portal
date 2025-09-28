import {
  Bell,
  Menu,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { isEmpty, isNull, startCase } from "lodash";
import CircleAvatar from "@/components/custom/Avatar";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/store/slices/authSlice";

const DashboardLayout = ({
  sidebarOpen,
  setSidebarOpen,
  children,
  activeTab,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // Static notification data for now
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "appointment",
      title: "Upcoming Appointment",
      message: "You have an appointment with Dr. Smith tomorrow at 2:00 PM",
      time: "2 hours ago",
      read: false,
      icon: Calendar,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: 2,
      type: "reminder",
      title: "Vaccination Due",
      message: "Max's annual vaccination is due next week",
      time: "1 day ago",
      read: false,
      icon: AlertCircle,
      color: "text-orange-600 bg-orange-50",
    },
    {
      id: 3,
      type: "completed",
      title: "Lab Results Ready",
      message: "Lab results for Bella are now available",
      time: "2 days ago",
      read: true,
      icon: FileText,
      color: "text-green-600 bg-green-50",
    },
    {
      id: 4,
      type: "system",
      title: "Profile Updated",
      message: "Your profile information has been successfully updated",
      time: "3 days ago",
      read: true,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
    {
      id: 5,
      type: "reminder",
      title: "Medication Reminder",
      message: "Time to give Charlie his evening medication",
      time: "1 week ago",
      read: true,
      icon: Clock,
      color: "text-purple-600 bg-purple-50",
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    // Handle navigation based on notification type
    switch (notification.type) {
      case "appointment":
        router.push("/dashboard/pet-owner/appointment");
        break;
      case "reminder":
        // Could navigate to specific pet or medication page
        break;
      case "completed":
        // Could navigate to lab results or medical records
        break;
      default:
        break;
    }
    setNotificationDropdownOpen(false);
  };

  const handleMyAccount = () => {
    setDropdownOpen(false);
    router.push("/dashboard/pet-owner/settings");
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    console.log("🔄 Dashboard logout initiated...");

    try {
      // Immediately clear all state for instant UI feedback
      dispatch(clearAuth());
      queryClient.clear();

      // Then perform the actual logout
      const result = await logout();
      console.log("Logout result:", result);

      console.log("✅ Logout completed, redirecting...");
      // Force navigation to root
      window.location.href = "/";
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Force redirect anyway to prevent user being stuck
      window.location.href = "/";
    }
  };

  return (
    <div className="flex-1 lg:ml-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeTab}
                </h2>
                <p className="text-sm text-gray-500">
                  Manage your {activeTab} efficiently
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() =>
                    setNotificationDropdownOpen(!notificationDropdownOpen)
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const IconComponent = notification.icon;
                          return (
                            <button
                              key={notification.id}
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors ${
                                !notification.read ? "bg-blue-50/30" : ""
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`p-2 rounded-full ${notification.color} flex-shrink-0`}
                                >
                                  <IconComponent size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p
                                      className={`text-sm font-medium ${
                                        !notification.read
                                          ? "text-gray-900"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell
                            size={32}
                            className="text-gray-300 mx-auto mb-2"
                          />
                          <p className="text-sm text-gray-500">
                            No notifications yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setNotificationDropdownOpen(false);
                            router.push("/dashboard/pet-owner/notifications");
                          }}
                          className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {!isNull(user?.user_metadata?.profilePhoto) ||
                    !isEmpty(user?.user_metadata?.profilePhoto) ? (
                      <CircleAvatar
                        src={user?.user_metadata?.profilePhoto}
                        alt="John Doe"
                        size="xs"
                      />
                    ) : (
                      user?.user_metadata?.first_name ||
                      user?.user_metadata?.email?.charAt(0)?.toUpperCase() ||
                      "U"
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.firstName && profile?.lastName
                          ? `${profile.firstName} ${profile.lastName}`
                          : user?.user_metadata?.first_name
                          ? `${user.user_metadata.first_name} ${
                              user.user_metadata.last_name || ""
                            }`.trim()
                          : "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <strong className="text-xs text-gray-500">
                        {startCase(user?.user_metadata.role).replace("-", "")}
                      </strong>
                    </div>

                    <button
                      onClick={handleMyAccount}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} />
                      <span>My Account</span>
                    </button>

                    <button
                      onClick={() =>
                        router.push("/dashboard/pet-owner/settings")
                      }
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="p-4 lg:p-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
