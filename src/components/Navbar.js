import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav, Form, FormControl, Button, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

const Navbar = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

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
            <Nav.Link as={Link} to="/">{t('navigation.about')}</Nav.Link>
          </Nav>
          <Form className="d-flex" onSubmit={handleSearch}>
            <InputGroup>
              <FormControl
                type="search"
                placeholder={t('search.placeholder')}
                className="me-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t('search.placeholder')}
              />
              {searchQuery && (
                <Button 
                  variant="outline-light" 
                  onClick={handleClearSearch}
                  aria-label={t('search.clearSearch')}
                  style={{ borderLeft: 'none' }}
                >
                  ✕
                </Button>
              )}
              <Button variant="outline-light" type="submit" aria-label={t('search.button')}>
                {t('search.button')}
              </Button>
            </InputGroup>
          </Form>
          <div className="ms-2">
            <LanguageSwitcher variant="navbar" />
          </div>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
