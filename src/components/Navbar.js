import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
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
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold">
          <i className="bi bi-book me-2"></i>
          Klinkemipedia
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">
              <i className="bi bi-house-door me-1"></i>
              {t('navigation.home')}
            </Nav.Link>
            <Nav.Link as={Link} to="/articles">
              <i className="bi bi-journal-text me-1"></i>
              {t('navigation.articles')}
            </Nav.Link>
            <Nav.Link as={Link} to="/tags">
              <i className="bi bi-tags me-1"></i>
              {t('navigation.tags')}
            </Nav.Link>
            <Nav.Link as={Link} to="/about">
              <i className="bi bi-info-circle me-1"></i>
              {t('navigation.about')}
            </Nav.Link>

            {/* Language Switcher */}
            <NavDropdown 
              title={
                <>
                  <i className="bi bi-globe me-1"></i>
                  {i18n.language === 'sv' ? 'Svenska' : 'English'}
                </>
              } 
              id="language-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={() => changeLanguage('sv')}>
                Svenska
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => changeLanguage('en')}>
                English
              </NavDropdown.Item>
            </NavDropdown>

            {/* User Menu */}
            {user ? (
              <NavDropdown 
                title={
                  <>
                    <i className="bi bi-person-circle me-1"></i>
                    {user.username}
                  </>
                } 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to={`/profile/${user.username}`}>
                  <i className="bi bi-person me-2"></i>
                  {t('navigation.profile')}
                </NavDropdown.Item>
                {(user.role === 'admin' || user.role === 'contributor') && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin">
                      <i className="bi bi-gear me-2"></i>
                      {t('navigation.admin')}
                    </NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  {t('navigation.logout')}
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login">
                <i className="bi bi-box-arrow-in-right me-1"></i>
                {t('navigation.login')}
              </Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;