import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="sm">
        <Container>
          <Navbar.Brand as={Link} to="/">Candidate Portal</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {!loggedIn && <Nav.Link as={Link} to="/login">Login</Nav.Link>}
            {!loggedIn && <Nav.Link as={Link} to="/register">Register</Nav.Link>}
            {loggedIn && <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>}
            {loggedIn && <Nav.Link onClick={handleLogout}>Logout</Nav.Link>}
          </Nav>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
}
