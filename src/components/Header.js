import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import logo_Bob from '../assets/logo_Bob.png';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from "../store/userSlice";
import axios from 'axios';

const Header = ({ hideIcons, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.user);
  console.log("Header User:", user);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const notifications = [
    { id: 1, message: "📢 Bank of Baroda posted a new opening.", time: "1h ago", read: true },
    { id: 2, message: "✅ Application submitted successfully.", time: "3h ago", read: true },
  ];

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "https://dev.bobjava.sentrifugo.com:8443/dev-auth-app/api/v1/candidate-auth/logout",
        {
          headers: {
            "X-Client": "candidate",
            "Content-Type": "application/json"
          }
        }
      );
      dispatch(clearUser());
      navigate("/login");
    } catch(e) {
      console.error("Logout failed:", e);
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setShowNotification(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* TOP HEADER BAR */}
      <Navbar
        sticky="top"
        bg="warning"
        variant="light"
        expand="lg"
        className="py-2"
        style={{ zIndex: 1030, height: "64px" }}
      >
        <div className="container-fluid">
          <Navbar.Brand className="fw-bold logobob">
            <img src={logo_Bob} alt="BobApp Logo" className="me-2" />
          </Navbar.Brand>

          {!hideIcons && (
            <div className="d-flex align-items-center">

              {/* Notifications */}
              <Button
                variant="link"
                className="me-2 position-relative"
                style={{
                  backgroundColor: "white",
                  borderRadius: "20%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setShowNotification((prev) => !prev)}
              >
                <FontAwesomeIcon icon={faBell} size="lg" style={{ color: "orangered" }} />
              </Button>

              {/* Notification Popup */}
              {showNotification && (
                <Card
                  ref={notificationRef}
                  className="position-absolute"
                  style={{
                    top: "60px",
                    right: "80px",
                    width: "350px",
                    maxHeight: "400px",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                  }}
                >
                  <Card.Header className="bg-white">
                    <h6 className="fw-bold mb-0">Notifications</h6>
                  </Card.Header>
                  <Card.Body className="p-0" style={{ maxHeight: "350px", overflowY: "auto" }}>
                    {notifications.map((note) => (
                      <div key={note.id} className="p-3 border-bottom">
                        <p className="mb-1">{note.message}</p>
                        <small className="text-muted">{note.time}</small>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              )}

              {/* USER ICON */}
              <div className="position-relative" ref={dropdownRef}>
                <div className='d-flex align-items-center gap-2'>
                  <div
                    onClick={() => setShowDropdown((prev) => !prev)}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "20%",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <FontAwesomeIcon icon={faUser} size="lg" style={{ color: "orangered" }} />
                  </div>
                  <div>
                    <p style={{ color: '#fff', marginTop: '10px' }}>{user?.full_name}</p>
                  </div>
                </div>

                {showDropdown && (
                  <div className="position-absolute end-0 mt-2 p-2 bg-white border rounded shadow" style={{ minWidth: "200px" }}>
                    <p className="mb-1">{user?.full_name}</p>
                    <p className="mb-0 text-muted">{user?.role}</p>
                    <hr />
                    <p
                      style={{ cursor: "pointer" }}
                      onClick={handleLogout}
                    >
                      Logout
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Navbar>

      {/* 👇 STICKY MENU BELOW HEADER */}
      {!hideIcons && (
        <div
          className="bg-white border-bottom"
          style={{
            position: "sticky",
            top: "64px",
            zIndex: 1029,
          }}
        >
          <ul className="nav nav-tabs navbarupload container-fluid px-3">
            {/* <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'career' ? 'active' : ''}`}
                onClick={() => setActiveTab('career')}
              >
                Home
              </button>
            </li> */}

            {/* <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'resume' ? 'active border-0' : ''}`}
                onClick={() => setActiveTab('resume')}
              >
                Upload Resume
              </button>
            </li> */}

            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'info' ? 'active border-0' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                My Profile
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'jobs' ? 'active border-0' : ''}`}
                onClick={() => setActiveTab('jobs')}
              >
                Current Opportunities
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'applied-jobs' ? 'active border-0' : ''}`}
                onClick={() => setActiveTab('applied-jobs')}
              >
                Applied Jobs
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Header;
