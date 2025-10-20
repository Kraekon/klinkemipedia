import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './UserMenu.css';

const UserMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <NavDropdown
      title={
        <span className="user-menu-title">
          <i className="bi bi-person-circle user-icon"></i>
          <span className="username">{user.username}</span>
        </span>
      }
      id="user-menu"
      align="end"
      className="user-menu"
    >
      <NavDropdown.Item onClick={() => navigate(`/profile/${user.username}`)}>
        {t('profile.title')}
      </NavDropdown.Item>
      
      {user.role === 'admin' && (
        <NavDropdown.Item onClick={() => navigate('/admin')}>
          {t('navigation.admin')}
        </NavDropdown.Item>
      )}
      
      <NavDropdown.Divider />
      
      <NavDropdown.Item onClick={handleLogout}>
        {t('auth.logout')}
      </NavDropdown.Item>
    </NavDropdown>
  );
};

export default UserMenu;