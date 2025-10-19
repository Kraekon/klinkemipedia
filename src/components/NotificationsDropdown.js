import React, { useState, useEffect } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './NotificationsDropdown.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const NotificationsDropdown = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        params: { limit: 20 },
        withCredentials: true
      });
      setNotifications(response.data.data || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, { withCredentials: true });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Dropdown align="end" className="notifications-dropdown">
      <Dropdown.Toggle variant="link" className="notification-bell">
        🔔
        {unreadCount > 0 && (
          <Badge bg="danger" className="notification-badge">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>{t('notifications.title')}</Dropdown.Header>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Dropdown.Item
              key={notification._id}
              onClick={() => !notification.read && markAsRead(notification._id)}
              className={!notification.read ? 'unread' : ''}
            >
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <small className="text-muted">
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
            </Dropdown.Item>
          ))
        ) : (
          <Dropdown.Item disabled>{t('notifications.none')}</Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationsDropdown;