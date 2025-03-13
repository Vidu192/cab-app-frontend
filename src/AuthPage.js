import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Form, Container, Card, Alert } from "react-bootstrap";

function AuthPage() {
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [contact, setContact] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  // Handle User Login
  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/users/userlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password: userPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userId", data.userid);

        switch (data.userrole) {
          case 0:
            navigate("/admin");
            break;
          case 1:
            navigate("/driver");
            break;
          case 2:
            navigate("/customer");
            break;
          default:
            setNotification("Invalid user role.");
        }
      } else {
        setNotification("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setNotification("Unable to connect to the server.");
      console.error("Login Error:", error);
    }
  };

  // Handle User Registration
  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/users/userregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email: userEmail,
          phonenumber: contact,
          password: userPassword,
        }),
      });

      if (response.ok) {
        setNotification("Registration successful! Redirecting to login...");
        setTimeout(() => setIsSignUp(false), 2000);
      } else {
        setNotification("Registration failed. Please try again.");
      }
    } catch (error) {
      setNotification("Server connection error.");
      console.error("Registration Error:", error);
    }
  };

  return (
    <div 
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6e8efb, #a777e3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <Container className="d-flex justify-content-center">
        <Card 
          className="shadow-lg border-0" 
          style={{ 
            width: "450px", 
            borderRadius: "20px", 
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.95)"
          }}
        >
          <Card.Header 
            style={{
              background: isSignUp ? "#007bff" : "#28a745",
              color: "white",
              padding: "20px",
              textAlign: "center",
              borderBottom: "none"
            }}
          >
            <h3 className="mb-0" style={{ fontWeight: "600" }}>
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h3>
            <p className="mt-2" style={{ opacity: "0.8", fontSize: "14px" }}>
              {isSignUp ? "Join us today!" : "Sign in to continue"}
            </p>
          </Card.Header>
          
          <Card.Body className="p-5">
            {notification && (
              <Alert 
                variant={notification.includes("successful") ? "success" : "danger"} 
                className="mb-4 rounded-pill text-center"
              >
                {notification}
              </Alert>
            )}
            
            <Form onSubmit={isSignUp ? handleRegister : handleLogin}>
              {isSignUp && (
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-pill"
                    style={{ padding: "12px 20px", borderColor: "#ddd" }}
                  />
                </Form.Group>
              )}
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  className="rounded-pill"
                  style={{ padding: "12px 20px", borderColor: "#ddd" }}
                />
              </Form.Group>
              
              {isSignUp && (
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter your phone number"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    className="rounded-pill"
                    style={{ padding: "12px 20px", borderColor: "#ddd" }}
                  />
                </Form.Group>
              )}
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  required
                  className="rounded-pill"
                  style={{ padding: "12px 20px", borderColor: "#ddd" }}
                />
              </Form.Group>
              
              <Button 
                variant={isSignUp ? "primary" : "success"} 
                type="submit" 
                className="w-100 rounded-pill py-2 mb-3"
                style={{ 
                  fontWeight: "600", 
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={e => e.target.style.opacity = "0.9"}
                onMouseOut={e => e.target.style.opacity = "1"}
              >
                {isSignUp ? "Register" : "Login"}
              </Button>
              
              <Button
                variant="link"
                className="w-100 text-decoration-none text-muted"
                onClick={() => setIsSignUp(!isSignUp)}
                style={{ fontSize: "14px" }}
              >
                {isSignUp ? (
                  <span>
                    Already have an account? <span style={{ color: "#007bff" }}>Login here</span>
                  </span>
                ) : (
                  <span>
                    New user? <span style={{ color: "#28a745" }}>Register here</span>
                  </span>
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default AuthPage;