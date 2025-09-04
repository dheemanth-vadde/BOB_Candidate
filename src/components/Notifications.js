import React, { useState, useEffect } from "react";
import { Card, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Static notifications (same as in Header for now)
    setNotifications([
      { id: 1, message: "Bank of Baroda has posted a new opening for Probationary Officer (PO).", time: "1h ago", read: true },
      { id: 2, message: "Your application for Relationship Manager has been successfully submitted.", time: "3h ago", read: true },
      { id: 3, message: "Application for Assistant Manager is currently under review by HR.", time: "1d ago", read: true },
      { id: 4, message: "Online assessment for Clerk role scheduled on 15 Sept, 11:00 AM.", time: "2d ago", read: true },
      { id: 5, message: "Congratulations! You are shortlisted for the final interview round (Senior Analyst).", time: "3d ago", read: true },
    ]);
  }, []);

  return (
    <div>
      <Header />
      <Container className="my-4 text-center">
        <div className="row mb-3">
          <div className="col-md-6 mx-auto">
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
              <h2 className="mb-4 fw-bold" style={{ color: "#000" }}>Notifications</h2>
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
                      borderLeft: `6px solid ${note.read ? "#FF6F00" : "#FF6F00"}`,
                      backgroundColor: note.read ? "#f8f9fa" : "white",
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
