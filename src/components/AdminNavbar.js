import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav } from 'react-bootstrap';

const AdminNavbar = () => {
  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" className="navbar">
      <Container>
        <BSNavbar.Brand as={Link} to="/admin" className="navbar-brand">
          Klinkemipedia Admin
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="admin-navbar-nav" />
        <BSNavbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin/new">New Article</Nav.Link>
            <Nav.Link as={Link} to="/admin/users">Users</Nav.Link>
            <Nav.Link as={Link} to="/">View Site</Nav.Link>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default AdminNavbar;
