import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck,
  Archive,
  Trash2,
  Filter,
  Search,
  Calendar,
  CreditCard,
  Stethoscope,
  AlertCircle,
  Info,
  ExternalLink,
  Clock,
  Eye,
  Settings,
  RefreshCw,
  MoreVertical,
  X
} from 'lucide-react';
import { 
  getUserNotifications, 
  markNotificationRead, 
  getUnreadNotificationCount,
  getRecentAuditActivities 
} from '../utils/auditLogger';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.NEXT_PUBLIC_PET_PORTAL_ANON
);

const NotificationsSection = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read, today, week
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadNotifications(),
        loadAuditLogs(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getUserNotifications(user?.id, 100, 0);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await getRecentAuditActivities(50, user?.id);
      setAuditLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const loadStats = async () => {
    try {
      const unreadCount = await getUnreadNotificationCount(user?.id);
      const allNotifications = await getUserNotifications(user?.id, 1000, 0);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayCount = allNotifications.filter(n => 
        new Date(n.created_at) >= today
      ).length;

      const weekCount = allNotifications.filter(n => 
        new Date(n.created_at) >= weekAgo
      ).length;

      setStats({
        total: allNotifications.length,
        unread: unreadCount,
        today: todayCount,
        thisWeek: weekCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Apply filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read_at);
        break;
      case 'read':
        filtered = filtered.filter(n => n.read_at);
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(n => new Date(n.created_at) >= today);
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(n => new Date(n.created_at) >= weekAgo);
        break;
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const success = await markNotificationRead(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read_at: new Date().toISOString() }
              : notif
          )
        );
        loadStats();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);
      
      await Promise.all(
        unreadNotifications.map(n => markNotificationRead(n.id))
      );

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
      );
      loadStats();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleBulkMarkAsRead = async () => {
    try {
      await Promise.all(
        selectedNotifications.map(id => markNotificationRead(id))
      );

      setNotifications(prev => 
        prev.map(notif => 
          selectedNotifications.includes(notif.id)
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
      setSelectedNotifications([]);
      loadStats();
    } catch (error) {
      console.error('Error bulk marking as read:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete the selected notifications?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', selectedNotifications);

      if (error) throw error;

      setNotifications(prev => 
        prev.filter(notif => !selectedNotifications.includes(notif.id))
      );
      setSelectedNotifications([]);
      loadStats();
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read_at) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.hash = notification.action_url.replace('/dashboard/owner', '');
    }
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_reminder':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'vaccination_due':
        return <Stethoscope className="w-5 h-5 text-green-500" />;
      case 'payment_overdue':
      case 'invoice_generated':
      case 'payment_received':
        return <CreditCard className="w-5 h-5 text-orange-500" />;
      case 'system_alert':
      case 'audit_alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAuditIcon = (action) => {
    if (action === 'CREATE') return <span className="w-3 h-3 bg-green-500 rounded-full" />;
    if (action === 'UPDATE') return <span className="w-3 h-3 bg-blue-500 rounded-full" />;
    if (action === 'DELETE') return <span className="w-3 h-3 bg-red-500 rounded-full" />;
    if (action === 'LOGIN') return <span className="w-3 h-3 bg-purple-500 rounded-full" />;
    return <span className="w-3 h-3 bg-gray-400 rounded-full" />;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600 mt-1">
            Stay updated with your pet's health and appointments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-green-600">{stats.thisWeek}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filter Menu */}
      {showFilterMenu && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilterMenu(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'read', label: 'Read' },
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  filter === f.key
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedNotifications.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} selected
                </span>
                <button
                  onClick={handleBulkMarkAsRead}
                  className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <CheckCheck size={16} />
                  <span>Mark Read</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </>
            )}
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <CheckCheck size={16} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Notifications ({filteredNotifications.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'audit'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Activity Log ({auditLogs.length})
          </button>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              Loading...
            </div>
          ) : activeTab === 'notifications' ? (
            filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications found</p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-2 text-orange-600 hover:text-orange-700"
                  >
                    View all notifications
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read_at ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelectNotification(notification.id)}
                        className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${
                            notification.read_at ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
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
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${
                          notification.read_at ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            notification.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.priority}
                          </span>
                          {notification.action_url && (
                            <div className="flex items-center text-xs text-orange-600">
                              <ExternalLink size={12} className="mr-1" />
                              View details
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Audit Log Tab
            auditLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Archive className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-2">
                        {getAuditIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {log.action.toLowerCase()} {log.entity_type.replace('_', ' ')}
                          </h4>
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
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSection;