// src/components/Career.js
import React, { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import bannerImg from "../../assets/banner.png";
import careers from "../../assets/opportunities.png";
import whybob from "../../assets/whybob.png";
import isbob from "../../assets/isbob.png";
import "../../css/Career.css";
import Header from "../../app/layouts/Header";
import { useNavigate } from "react-router-dom";
 
const Home = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  return (
    <>
      <Header hideIcons={true} />
      <div className="" >
        <div className="bg-white" style={{
          position: "sticky",
          top: "64px",   // 👈 must equal Header height above
          zIndex: 10,
          margin: '1.5rem 1.5rem'
        }}>
        <ul className="nav nav-tabs navbarupload justify-content-start">
          <li className="nav-item">
            <button
              className={`nav-link bornav ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              Home
            </button>
          </li>
        </ul>
        </div>

        <div className="p-4 border">
          {/* Banner Section */}
          <div className="career-banner text-center">
            <img
              src={bannerImg}
              alt="Career Banner"
              className="img-fluid w-100"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          
          </div>
    
          {/* Careers Section */}
          <Container className="my-5 p-2">
            <Row className="text-center mb-4">
              <Col>
                <h2 className="fw-bold fs14">Careers</h2>
                <p>
                  Bank of Baroda focuses on its employees, offering a career rather
                  than just a job. Various initiatives are in place to groom
                  employees throughout their life cycle.
                </p>
              </Col>
            </Row>
    
            {/* Cards Section */}
            <Row>
              <Col xs={12} sm={6} md={4} className="mb-4">
              <div className="cardshadow">
                <Card className="h-100 shadow-sm text-center p-3 cardshadow">
                  <div className="icons">
                    <img
                      src={careers}
                      alt="Career Banner"
                      className="img-fluid w-100"
                      
                    />
                  </div>
                  <Card.Body>
                    <Card.Title>Current Opportunities</Card.Title>
                    <Card.Text className="text-primary fw-bold" style={{ cursor: 'pointer' }} onClick={() => window.open("https://www.bankofbaroda.in/career/current-opportunities", "_blank")}>
                      Know More →
                    </Card.Text>
                  </Card.Body>
                </Card>
                </div>
              </Col>
    
              <Col xs={12} sm={6} md={4} className="mb-4">
              <div className="cardshadow">
                <Card className="h-100 shadow-sm text-center p-3 cardshadow">
                  <div className="icons">
                    <img
                      src={whybob}
                      alt="Career Banner"
                      className="img-fluid w-100"
                    
                    />
                  </div>
                  <Card.Body>
                    <Card.Title>Why Bank of Baroda?</Card.Title>
                    <Card.Text className="text-primary fw-bold" style={{ cursor: 'pointer' }} onClick={() => window.open("https://www.bankofbaroda.in/career/why-bank-of-baroda", "_blank")}>
                      Know More →
                    </Card.Text>
                  </Card.Body>
                </Card>
                </div>
              </Col>
    
              <Col xs={12} sm={6} md={4} className="mb-4">
              <div className="cardshadow">
                <Card className="h-100 shadow-sm text-center p-3 cardshadow">
                  <div className="icons">
                    <img
                      src={isbob}
                      alt="Career Banner"
                      className="img-fluid w-100"
                      
                    />
                  </div>
                  <Card.Body>
                    <Card.Title>Is Bank of Baroda For Me?</Card.Title>
                    <Card.Text className="text-primary fw-bold" style={{ cursor: 'pointer' }} onClick={() => window.open("https://www.bankofbaroda.in/career/is-bank-of-baroda-for-me", "_blank")}>
                      Know More →
                    </Card.Text>
                  </Card.Body>
                </Card>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
};
 
export default Home;