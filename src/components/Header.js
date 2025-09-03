import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Button, OverlayTrigger, Tooltip, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import logo_Bob from '../assets/logo_Bob.png';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user?.user);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null); // 👈 ref for notification popup

  // Toggle dropdown
  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  // Close dropdown & notification when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotification(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
<Navbar sticky="top" bg="warning" variant="light" expand="lg" className="py-2" style={{ zIndex: 1030, height: "64px" }}>
      <div className="container-fluid">
        <Navbar.Brand href="#" className="fw-bold logobob">
          <img src={logo_Bob} alt="BobApp Logo" className="me-2" />
        </Navbar.Brand>

        <div className="d-flex align-items-center">
          {/* Notification Bell */}

          <Button
            variant="link"
            className="me-2 position-relative"
            style={{
              backgroundColor: "white",       // white background
              borderRadius: "50%",            // make it circular
              width: "35px",
              height: "35px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            onClick={() => setShowNotification((prev) => !prev)}
          >
            <FontAwesomeIcon
              icon={faBell}
              size="lg"
              style={{ color: "#FF6F00" }}    // orange bell
            />

            {/* 🔴 Notification Dot */}
            <span
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "8px",
                height: "8px",
                backgroundColor: "red",
                borderRadius: "50%",
                border: "2px solid white",   // neat border
              }}
            ></span>
          </Button>


          {/* Notification Popup */}
          {showNotification && (
            <Card
              ref={notificationRef} // 👈 attach ref here
              className="position-absolute"
              style={{
                top: "60px",
                right: "80px",
                width: "300px",
                zIndex: 1000,
                borderRadius: "10px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <h6 className="fw-bold">Job Application Update</h6>
                  <Button
                    variant="link"
                    size="sm"
                    style={{ textDecoration: "none", color: "red" }}
                    onClick={() => setShowNotification(false)}
                  >
                    ✕
                  </Button>
                </div>
                <p className="text-muted mb-2">
                  New openings at Bank of Baroda. Check details below. 
                </p>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => navigate("/notifications")}
                >
                  Know More
                </Button>
              </Card.Body>
            </Card>
          )}

          

          {/* User Profile Dropdown */}
          <div className="position-relative" ref={dropdownRef}>
            <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-profile">Profile</Tooltip>}>
              <FontAwesomeIcon
                icon={faUserCircle}
                size="2x"
                style={{ color: '#fff', cursor: "pointer" }}
                onClick={toggleDropdown}
              />
            </OverlayTrigger>

           {showDropdown && (
  <div
    className="position-absolute end-0 mt-2 p-2 bg-white border rounded shadow"
    style={{ minWidth: "200px", zIndex: 1000 }}
  >
    <p className="mb-1">{user?.full_name}</p>
    <p className="mb-0 text-muted">
      {user?.role === "L1" || user?.role === "L2" ? `${user.role} Approver` : user?.role}
    </p>

    {/* separator */}
    <hr className="my-2" />

    <p onClick={() => navigate('/login')} style={{cursor: 'pointer', margin: 0}}>Logout</p>
  </div>
)}

          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default Header;