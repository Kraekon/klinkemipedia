import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <BSNavbar.Brand as={Link} to="/admin" className="fw-bold">
          <i className="bi bi-book me-2"></i>
          Klinkemipedia Admin
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="admin-navbar-nav" />
        <BSNavbar.Collapse id="admin-navbar-nav">
          {/* Left side - View Site */}
          <Nav>
            <Nav.Link as={Link} to="/">
              <i className="bi bi-box-arrow-up-right me-1"></i>
              {t('navigation.viewSite')}
            </Nav.Link>
          </Nav>

          {/* Right side - Admin links, Language and User */}
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/admin">
              <i className="bi bi-speedometer2 me-1"></i>
              {t('navigation.dashboard')}
            </Nav.Link>
            
            {/* Content Management Dropdown */}
            <NavDropdown title={
              <>
                <i className="bi bi-file-text me-1"></i>
                Content
              </>
            } id="content-dropdown">
              <NavDropdown.Item as={Link} to="/admin/new">
                <i className="bi bi-plus-circle me-2"></i>
                {t('navigation.newArticle')}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/media">
                <i className="bi bi-images me-2"></i>
                {t('navigation.mediaLibrary')}
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/admin/categories">
                <i className="bi bi-folder me-2"></i>
                Categories
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/tags">
                <i className="bi bi-tags me-2"></i>
                {t('navigation.tags')}
              </NavDropdown.Item>
            </NavDropdown>
            
            {/* User Management Dropdown */}
            <NavDropdown title={
              <>
                <i className="bi bi-people me-1"></i>
                Users
              </>
            } id="users-dropdown">
              <NavDropdown.Item as={Link} to="/admin/users">
                <i className="bi bi-person-lines-fill me-2"></i>
                {t('navigation.users')}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/comments">
                <i className="bi bi-chat-left-text me-2"></i>
                {t('navigation.comments')}
              </NavDropdown.Item>
            </NavDropdown>

            {/* Language Switcher with Flags */}
            <NavDropdown 
              title={i18n.language === 'sv' ? '🇸🇪' : '🇬🇧'} 
              id="admin-language-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={() => changeLanguage('sv')}>
                🇸🇪 Svenska
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => changeLanguage('en')}>
                🇬🇧 English
              </NavDropdown.Item>
            </NavDropdown>

            {/* User Menu */}
            {user && (
              <NavDropdown 
                title={
                  <>
                    <i className="bi bi-person-circle me-1"></i>
                    {user.username}
                  </>
                } 
                id="admin-user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to={`/profile/${user.username}`}>
                  <i className="bi bi-person me-2"></i>
                  {t('navigation.profile')}
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  {t('navigation.logout')}
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default AdminNavbar;