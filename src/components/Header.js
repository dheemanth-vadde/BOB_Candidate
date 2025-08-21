import React,{ useState, useRef, useEffect } from 'react';
import { Navbar, Form, Button, InputGroup, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faGlobe, faUserCircle, faRightFromBracket, faUser, faCog } from '@fortawesome/free-solid-svg-icons';
import logo_Bob from '../assets/logo_Bob.png';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
const Header = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const user = useSelector((state) => state.user.user);
 
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <Navbar bg="warning" variant="light" expand="lg" className="py-2">
      <div className="container-fluid">
        <Navbar.Brand href="#" className="fw-bold logobob">
          <img src={logo_Bob} alt="BobApp Logo" className="me-2" />
         
        </Navbar.Brand>
        
        <div className="d-flex align-items-center w-50">
          <InputGroup>
            <Form.Control
              type="search"
              placeholder="Search..."
              className="border-0"
              aria-label="Search"
            />
            <InputGroup.Text className='bg-light'>
              <FontAwesomeIcon icon={faSearch} style={{ color: '#FF7043' }} />
            </InputGroup.Text>
          </InputGroup>
        </div>

        <div className="d-flex align-items-center">
          <Button variant="link" className="me-2" style={{ color: '#fff' }}>
            <FontAwesomeIcon icon={faGlobe} size="lg" />
          </Button>
          <Button variant="link" className="me-2" style={{ color: '#fff' }}>
            <FontAwesomeIcon icon={faBell} size="lg" />
          </Button>
          <Button variant="link" className="me-2" style={{ color: '#fff' }} onClick={() => navigate('/login')}>
            <FontAwesomeIcon icon={faRightFromBracket} size="lg" />
          </Button>
          <div className="position-relative" ref={dropdownRef}>
            <FontAwesomeIcon icon={faUserCircle} size="2x" style={{ color: '#fff' }}  onClick={toggleDropdown} />
            {showDropdown  && (
              <div
              className="position-absolute end-0 mt-2 p-2 bg-white border rounded shadow"
              style={{ minWidth: "200px", zIndex: 1000 }} >
                <p className="mb-1 fw-bold"> {user?.full_name}</p>
                {/* <p className="mb-0 text-muted">{user?.role} Approver</p> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default Header;
