import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Card, Row, Col, Button, Modal, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

function DriverDashboard() {
  const driverId = localStorage.getItem("userId");
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    const fetchAssignedBookings = async () => {
      try {
        const response = await fetch("http://localhost:8080/bookings/all");
        if (!response.ok) throw new Error("Failed to fetch bookings");
        
        const data = await response.json();
        const filteredData = data.filter(
          (booking) => String(booking.userid) === driverId && booking.bookstatus === 1 && booking.paymentstatus === 0
        );
        setAssignedBookings(filteredData);
      } catch (error) {
        console.error("Error fetching assigned bookings:", error);
      }
    };

    fetchAssignedBookings();
  }, [driverId]);

  const handlePaymentClick = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const processPayment = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
      alert("Please fill in all payment details");
      return;
    }

    try {
      const paymentData = {
        bookingId: selectedBooking.id,
        amount: selectedBooking.totalfee,
        paymentStatus: 1, // 1 for paid
        cardNumber: paymentDetails.cardNumber,
        // In a real app, you'd want to encrypt sensitive data
      };

      const response = await fetch(`http://localhost:8080/bookings/update/${selectedBooking.id}/paymentstatus`, {

        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),       
      });

      if (!response.ok) throw new Error("Payment failed");

      // Update the local state
      setAssignedBookings((prev) =>
        prev.filter((booking) => booking.id !== selectedBooking.id)
      );
      
      alert("Payment successful!");
      setShowPaymentModal(false);
      setPaymentDetails({ cardNumber: "", expiryDate: "", cvv: "" });
      setSelectedBooking(null);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="bg-dark min-vh-100 p-3">
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/" className="text-white mb-3 fw-bold">
              Cab Management System
            </Nav.Link>
            <Nav.Link as={Link} to="/customer" className="text-light py-2">
              Book a Cab
            </Nav.Link>
            <Nav.Link as={Link} to="/ViewBookings" className="text-light py-2">
              My Bookings
            </Nav.Link>
            <Nav.Link as={Link} to="/UserActiveBookings" className="text-light py-2">
              Current Bookings
            </Nav.Link>
            <Nav.Link as={Link} to="/" className="text-danger py-2 mt-3 fw-bold">
              Logout
            </Nav.Link>
          </Nav>
        </Col>

        <Col md={10}>
          <div className="mt-4">
            <h4 className="text-center mb-4">Driver ID: {driverId || "Not Available"}</h4>

            {assignedBookings.length > 0 ? (
              <Row>
                {assignedBookings.map((booking) => (
                  <Col key={booking.id} md={4} className="mb-4">
                    <Card className="shadow-sm">
                      <Card.Body>
                        <Card.Title>Booking ID: {booking.id}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">User ID: {booking.userid}</Card.Subtitle>
                        <Card.Text>
                          <strong>Car ID:</strong> {booking.carid} <br />
                          <strong>Pickup Location:</strong> {booking.location} <br />
                          <strong>Scheduled Time:</strong> {booking.time} <br />
                          <strong>Travel Distance:</strong> {booking.travelDistance > 0 ? `${booking.travelDistance} km` : "Not Complete"} <br />
                          <strong>Total Fee:</strong> ${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"} <br />
                          <strong>Payment Status:</strong> <span className="text-danger">Unpaid</span>
                        </Card.Text>
                        <p className="text-success fw-bold">Driver Accepted Your Booking</p>
                        <Button 
                          variant="primary"
                          onClick={() => handlePaymentClick(booking)}
                        >
                          Make Payment
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-center mt-4">No confirmed bookings assigned to you.</p>
            )}
          </div>
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Process Payment for Booking #{selectedBooking?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={processPayment}>
            <Form.Group className="mb-3">
              <Form.Label>Amount to Pay</Form.Label>
              <Form.Control
                type="text"
                value={`$${selectedBooking?.totalfee?.toFixed(2) || '0.00'}`}
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={handlePaymentInputChange}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                required
                maxLength="16"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="text"
                name="expiryDate"
                value={paymentDetails.expiryDate}
                onChange={handlePaymentInputChange}
                placeholder="MM/YY"
                required
                maxLength="5"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>CVV</Form.Label>
              <Form.Control
                type="text"
                name="cvv"
                value={paymentDetails.cvv}
                onChange={handlePaymentInputChange}
                placeholder="XXX"
                required
                maxLength="3"
              />
            </Form.Group>

            <div className="text-center">
              <Button variant="success" type="submit" className="me-2">
                Confirm Payment
              </Button>
              <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default DriverDashboard;