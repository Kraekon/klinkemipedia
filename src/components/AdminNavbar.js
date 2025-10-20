import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const { t } = useTranslation();
  
  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" className="navbar admin-navbar">
      <Container>
        <BSNavbar.Brand as={Link} to="/admin" className="navbar-brand">
          Klinkemipedia {t('navigation.admin')}
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="admin-navbar-nav" />
        <BSNavbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin">{t('navigation.dashboard')}</Nav.Link>
            
            {/* Content Management Dropdown */}
            <NavDropdown title="Content" id="content-dropdown">
              <NavDropdown.Item as={Link} to="/admin/new">
                {t('navigation.newArticle')}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/media">
                {t('navigation.mediaLibrary')}
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/admin/categories">
                Categories
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/tags">
                {t('navigation.tags')}
              </NavDropdown.Item>
            </NavDropdown>
            
            {/* User Management Dropdown */}
            <NavDropdown title="Users" id="users-dropdown">
              <NavDropdown.Item as={Link} to="/admin/users">
                {t('navigation.users')}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/comments">
                {t('navigation.comments')}
              </NavDropdown.Item>
            </NavDropdown>
            
            <Nav.Link as={Link} to="/">{t('navigation.viewSite')}</Nav.Link>
          </Nav>
          <div className="ms-2">
            <LanguageSwitcher variant="navbar" />
          </div>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default AdminNavbar;