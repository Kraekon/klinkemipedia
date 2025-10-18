import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav, Form, FormControl, Button, InputGroup } from 'react-bootstrap';

const Navbar = () => {
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
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/">Articles</Nav.Link>
            <Nav.Link as={Link} to="/">About</Nav.Link>
          </Nav>
          <Form className="d-flex" onSubmit={handleSearch}>
            <InputGroup>
              <FormControl
                type="search"
                placeholder="Search articles..."
                className="me-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search articles"
              />
              {searchQuery && (
                <Button 
                  variant="outline-light" 
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  style={{ borderLeft: 'none' }}
                >
                  ✕
                </Button>
              )}
              <Button variant="outline-light" type="submit" aria-label="Submit search">
                Search
              </Button>
            </InputGroup>
          </Form>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
