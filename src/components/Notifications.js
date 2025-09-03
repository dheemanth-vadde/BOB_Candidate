// src/components/Tabs/Notifications.js
import React, { useState, useEffect } from "react";
import { Card, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock Bank of Baroda themed notifications
    setNotifications([
      { id: 1, message: "📢 Bank of Baroda has posted a new opening for Probationary Officer (PO).", time: "1h ago" },
      { id: 2, message: "✅ Your application for Relationship Manager has been successfully submitted.", time: "3h ago" },
      { id: 3, message: "🔎 Application for Assistant Manager is currently under review by HR.", time: "1d ago" },
      { id: 4, message: "📅 Online assessment for Clerk role scheduled on 15 Sept, 11:00 AM.", time: "2d ago" },
      { id: 5, message: "⭐ Congratulations! You are shortlisted for the final interview round (Senior Analyst).", time: "3d ago" },
      { id: 6, message: "🎓 New campus recruitment drive announced for Graduate Trainee positions.", time: "5d ago" },
      { id: 7, message: "📢 BoB HR team has published the final results for Assistant Manager recruitment.", time: "1w ago" },
      { id: 8, message: "⚡ Reminder: Please update your KYC details before applying for new roles.", time: "2w ago" },
      { id: 9, message: "📢 New job alert: Wealth Manager positions open across multiple cities.", time: "3w ago" },
      { id: 10, message: "📅 Technical interview scheduled for IT Officer role on 25 Sept, 2:00 PM.", time: "1mo ago" },
      { id: 11, message: "✅ Application for Marketing Associate has been successfully submitted.", time: "1mo ago" },
      { id: 12, message: "⭐ You have been selected in the merit list for Clerk recruitment 2025.", time: "1mo ago" },
    ]);
  }, []);

  return (
    <div>
      <Header />
      <Container className="my-4 text-center">
        {/* Back Button aligned right */}
        <div className="row mb-3">
            <div className="col-md-6  mx-auto">
            <div className="d-flex justify-content-center align-items-center position-relative">
                <Button
                    onClick={() => navigate("/candidate-portal")}
                    style={{
                    backgroundColor: "#FF6F00",
                    border: "none",
                    borderRadius: "50%",
                    width: "45px",
                    height: "45px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: "bold",
                    position: "absolute",
                    left: "0px"
                    }}
                >
            ←
          </Button>
          
                {/* Title */}
                <h2 className="mb-4 fw-bold" style={{ color: "#000" }}>
                Notifications 
            </h2>
            </div>


        {notifications.length === 0 ? (
          <p className="text-muted">No notifications</p>
        ) : (
          <div className="d-flex flex-column align-items-center">
            {notifications.map((note) => (
              <Card
                key={note.id}
                className="shadow-sm mb-3 w-100"
                style={{
                  borderLeft: `6px solid #FF6F00`,
                  textAlign: "left",
                }}
              >
                <Card.Body>
                  <Card.Text className="mb-1">{note.message}</Card.Text>
                  <small className="text-muted">{note.time}</small>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
            </div>
          
        </div>
      </Container>
    </div>
  );
};

export default Notifications;
