import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.NEXT_PUBLIC_PET_PORTAL_ANON
);

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      
      // Count unread notifications
      const unread = data?.filter(n => !n.read_at).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          !n.read_at 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Create new notification
  const createNotification = async (notificationData) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);

      return { success: true, data };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Get notification by type
  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.type === type);
  };

  // Get notifications by priority
  const getNotificationsByPriority = (priority) => {
    return notifications.filter(n => n.priority === priority);
  };

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    getNotificationsByType,
    getNotificationsByPriority
  };
};