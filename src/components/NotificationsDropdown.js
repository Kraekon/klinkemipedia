import React, { useState, useEffect } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './NotificationsDropdown.css';

const NotificationsDropdown = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', {
        params: { limit: 20 },
        withCredentials: true
      });
      setNotifications(response.data.data || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        withCredentials: true
      });
      // Update local state
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await axios.put('/api/notifications/read-all', {}, {
        withCredentials: true
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      comment_reply: '💬',
      mention: '📢',
      upvote: '👍',
      badge_earned: '🏆',
      new_follower: '👤'
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return t('notifications.timeAgo.justNow');
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t('notifications.timeAgo.minutesAgo', { count: minutes });
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('notifications.timeAgo.hoursAgo', { count: hours });
    
    const days = Math.floor(hours / 24);
    return t('notifications.timeAgo.daysAgo', { count: days });
  };

  return (
    <Dropdown className="notifications-dropdown" align="end">
      <Dropdown.Toggle variant="link" id="notifications-dropdown" className="notifications-toggle">
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <Badge bg="danger" pill className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notifications-menu">
        <div className="notifications-header">
          <h6>{t('notifications.title')}</h6>
          {unreadCount > 0 && (
            <button 
              className="mark-all-btn" 
              onClick={markAllAsRead}
              disabled={loading}
            >
              {t('notifications.markAllAsRead')}
            </button>
          )}
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              {t('notifications.noNotifications')}
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification._id);
                  }
                }}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{getTimeAgo(notification.createdAt)}</div>
                </div>
                {notification.link && (
                  <Link to={notification.link} className="notification-link-overlay" />
                )}
              </div>
            ))
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationsDropdown;
