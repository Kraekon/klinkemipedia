import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav } from 'react-bootstrap';
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
            <Nav.Link as={Link} to="/admin/new">{t('navigation.newArticle')}</Nav.Link>
            <Nav.Link as={Link} to="/admin/media">📁 {t('navigation.mediaLibrary')}</Nav.Link>
            <Nav.Link as={Link} to="/admin/media/analytics">📊 {t('navigation.mediaAnalytics')}</Nav.Link>
            <Nav.Link as={Link} to="/admin/tags">🏷️ {t('navigation.tags')}</Nav.Link>
            <Nav.Link as={Link} to="/admin/users">{t('navigation.users')}</Nav.Link>
            <Nav.Link as={Link} to="/admin/comments">💬 {t('navigation.comments')}</Nav.Link>
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
