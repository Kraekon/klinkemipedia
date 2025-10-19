import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';
import SearchBar from './SearchBar';
import NotificationsDropdown from './NotificationsDropdown';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" className="navbar">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="navbar-brand">
          Klinkemipedia
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">{t('navigation.home')}</Nav.Link>
            <Nav.Link as={Link} to="/">{t('navigation.articles')}</Nav.Link>
            <Nav.Link as={Link} to="/tags">{t('navigation.tags')}</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/bookmarks">Bookmarks</Nav.Link>
                <Nav.Link as={Link} to="/collections">Collections</Nav.Link>
              </>
            )}
            <Nav.Link as={Link} to="/leaderboard">{t('leaderboard.title')}</Nav.Link>
            <Nav.Link as={Link} to="/">{t('navigation.about')}</Nav.Link>
          </Nav>
          <div className="navbar-search-container d-none d-lg-block">
            <SearchBar compact />
          </div>
          <div className="ms-2">
            <LanguageSwitcher variant="navbar" />
          </div>
          {user ? (
            <>
              <div className="ms-2">
                <NotificationsDropdown />
              </div>
              <div className="ms-2">
                <UserMenu />
              </div>
            </>
          ) : (
            <div className="ms-2 d-flex gap-2">
              <Button 
                as={Link} 
                to="/login" 
                variant="outline-light"
                size="sm"
              >
                {t('auth.login')}
              </Button>
              <Button 
                as={Link} 
                to="/register" 
                variant="success"
                size="sm"
              >
                {t('auth.register')}
              </Button>
            </div>
          )}
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
