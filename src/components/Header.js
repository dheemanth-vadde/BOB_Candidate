import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import logo_Bob from '../assets/logo_Bob.png';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = ({ hideIcons }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user?.user);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([
{ id: 1, message: "📢 Bank of Baroda has posted a new opening for Probationary Officer (PO).", time: "1h ago", read: true },
      { id: 2, message: "✅ Your application for Relationship Manager has been successfully submitted.", time: "3h ago", read: true },
      { id: 3, message: "🔎 Application for Assistant Manager is currently under review by HR.", time: "1d ago", read: true },
      { id: 4, message: "📅 Online assessment for Clerk role scheduled on 15 Sept, 11:00 AM.", time: "2d ago",  read: true},
      { id: 5, message: "⭐ Congratulations! You are shortlisted for the final interview round (Senior Analyst).", time: "3d ago" ,  read: true},
      { id: 6, message: "🎓 New campus recruitment drive announced for Graduate Trainee positions.", time: "5d ago",  read: true },
      { id: 7, message: "📢 BoB HR team has published the final results for Assistant Manager recruitment.", time: "1w ago",  read: true },
      { id: 8, message: "⚡ Reminder: Please update your KYC details before applying for new roles.", time: "2w ago" ,  read: true},
      { id: 9, message: "📢 New job alert: Wealth Manager positions open across multiple cities.", time: "3w ago" ,  read: true},
      { id: 10, message: "📅 Technical interview scheduled for IT Officer role on 25 Sept, 2:00 PM.", time: "1mo ago" ,  read: true},
      { id: 11, message: "✅ Application for Marketing Associate has been successfully submitted.", time: "1mo ago",  read: true },
      { id: 12, message: "⭐ You have been selected in the merit list for Clerk recruitment 2025.", time: "1mo ago",  read: true }

  ]);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown & notification when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotification(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <Navbar sticky="top" bg="warning" variant="light" expand="lg" className="py-2" style={{ zIndex: 1030, height: "64px" }}>      <div className="container-fluid">
      <Navbar.Brand className="fw-bold logobob">
        <img src={logo_Bob} alt="BobApp Logo" className="me-2" />
      </Navbar.Brand>

      {!hideIcons && (
        <div className="d-flex align-items-center">
          {/* Notification Bell */}
          <Button
            variant="link"
            className="me-2 position-relative"
            style={{
              backgroundColor: "white",
              borderRadius: "50%",
              width: "35px",
              height: "35px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            onClick={() => setShowNotification((prev) => !prev)}
          >
            <FontAwesomeIcon icon={faBell} size="lg" style={{ color: "orangered" }} />
           
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
              ref={notificationRef}
              className="position-absolute backgroundcol"
              style={{
                top: "60px",
                right: "80px",
                width: "350px",
                maxHeight: "400px",
                borderRadius: "10px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                <h6 className="fw-bold mb-0">Notifications</h6>
              </Card.Header>
              <Card.Body className="p-0" style={{ overflowY: 'auto', maxHeight: '350px' }}>
                {notifications.length === 0 ? (
                  <p className="text-muted text-center py-3">No notifications</p>
                ) : (
                  notifications.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 border-bottom"
                      style={{
                        cursor: 'pointer',
                        backgroundColor: note.read ? 'white' : '#fff9e6'
                      }}
                      onClick={() => {
                        markAsRead(note.id);
                        navigate('/notifications');
                        setShowNotification(false);
                      }}
                    >
                      <p className="mb-1" style={{ fontSize: '0.9rem' }}>{note.message}</p>
                      <small className="text-muted">{note.time}</small>
                    </div>
                  ))
                )}
                <div className="text-center p-2">
                  <Button
                    variant="outline-warning bgbtn"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setShowNotification(false);
                      navigate('/notifications');
                    }}
                    style={{  border: '1px solid orangered' }}
                  >
                    View All
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* User Profile Dropdown */}
          <div className="position-relative" ref={dropdownRef}>
            <FontAwesomeIcon
              icon={faUserCircle}
              size="2x"
              style={{ color: '#fff', cursor: "pointer" }}
              onClick={() => setShowDropdown(prev => !prev)}
            />
            {showDropdown && (
              <div className="position-absolute end-0 mt-2 p-2 bg-white border rounded shadow" style={{ minWidth: "200px" }}>
                <p className="mb-1">{user?.full_name}</p>
                <p className="mb-0 text-muted">
                  {user?.role === "L1" || user?.role === "L2" ? `${user.role} Approver` : user?.role}
                </p>
                <hr className="my-2" />
                <p onClick={() => navigate('/careers-portal')} style={{ cursor: 'pointer', margin: 0 }}>Logout</p>
              </div>
            )}
          </div>
        </div>
      )}

      {hideIcons && (
        <div>
          <button className="register-here-btn shadow-sm" onClick={() => navigate('/login')}>
            Register here
          </button>
        </div>
      )}
    </div>
    </Navbar>
  );
};

export default Header;
