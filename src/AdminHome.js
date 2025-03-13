import React, { useState } from "react";
import { Navbar, Nav, Container, Row, Col, Form, Button, Alert, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";

function AdminHome() {
  const [formData, setFormData] = useState({
    model: "",
    licensePlate: "",
    seats: "",
    capacity: "",
    pricePerKm: "",
    photo: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Resize and encode image to Base64
  const resizeImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const maxSize = 500;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > width && height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        callback(canvas.toDataURL("image/jpeg"));
      };
    };
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      resizeImage(file, (resizedBase64) => {
        setFormData((prev) => ({ ...prev, photo: resizedBase64 }));
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:8080/cars/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "0" }),
      });

      if (!response.ok) throw new Error("Failed to add car");

      setSuccess("Car added successfully!");
      setFormData({ model: "", licensePlate: "", seats: "", capacity: "", pricePerKm: "", photo: "" });
      setShowModal(false); // Close the modal after successful submission
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col md={2} className="bg-dark min-vh-100 p-3">
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/" className="text-white mb-3 fw-bold">
            Cab Management System
            </Nav.Link>
            <Nav.Link as={Link} to="#" className="text-light py-2" onClick={() => setShowModal(true)}>
            Register Vehicle
            </Nav.Link>
            <Nav.Link as={Link} to="/ManageCar" className="text-light py-2">
              Manage Cab
            </Nav.Link>
            <Nav.Link as={Link} to="/DeleteDrivers" className="text-light py-2">
            Remove Drivers
            </Nav.Link>
            <Nav.Link as={Link} to="/DeleteUsers" className="text-light py-2">
            Remove Users
            </Nav.Link>
            <Nav.Link as={Link} to="/ManageBookings" className="text-light py-2">
            Manage Bookings
            </Nav.Link>
            <Nav.Link as={Link} to="/AddDriver" className="text-light py-2">
            Register Driver
            </Nav.Link>
            <Nav.Link as={Link} to="/" className="text-danger py-2 mt-3 fw-bold">
              Logout
            </Nav.Link>
          </Nav>
        </Col>

        {/* Main Content */}
        <Col md={10} className="p-4">
          <h2 className="mb-4">Manage Cars</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}



          {/* Add Car Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Register Vehicle</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Control type="text" name="model" value={formData.model} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>License Plate</Form.Label>
                  <Form.Control type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Seats</Form.Label>
                  <Form.Control type="number" name="seats" value={formData.seats} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Price per KM</Form.Label>
                  <Form.Control type="number" step="0.01" name="pricePerKm" value={formData.pricePerKm} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Photo</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Add Car
                </Button>
              </Form>
            </Modal.Body>
          </Modal> 
        </Col>
      </Row>
    </Container>
  );
}

export default AdminHome;