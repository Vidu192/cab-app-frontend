import React, { useState, useEffect } from "react";
import { Container, Card, Button, Modal, Form, Nav, Row, Col } from "react-bootstrap"; // Added Row, Col, removed Navbar
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [carList, setCarList] = useState([]); // Store car data from backend
  const [fetchError, setFetchError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit modal state
  const [carToEdit, setCarToEdit] = useState(null); // Selected car for editing

  // Fetch all cars from backend
  const loadCarData = () => {
    fetch("http://localhost:8080/cars/all")
      .then((response) => response.json())
      .then((data) => setCarList(data))
      .catch(() => setFetchError("Failed to fetch car details"));
  };

  // Fetch cars when the component loads
  useEffect(() => {
    loadCarData();
  }, []);

  // Open Edit Modal
  const openEditModal = (car) => {
    setCarToEdit(car);
    setIsEditModalOpen(true);
  };

  // Handle Edit Input Change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCarToEdit((prevCar) => ({ ...prevCar, [name]: value }));
  };

  // Handle Save Changes
  const saveCarChanges = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/cars/update/${carToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carToEdit),
      });

      if (!response.ok) throw new Error("Failed to update car details");

      setIsEditModalOpen(false);
      loadCarData(); // Refresh car list
    } catch (error) {
      setFetchError("Error updating car details");
    }
  };

  // Handle Delete Car
  const removeCar = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    try {
      const response = await fetch(`http://localhost:8080/cars/delete/${carId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete car");

      loadCarData(); // Refresh car list after deletion
    } catch (error) {
      setFetchError("Error deleting car");
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
            <Nav.Link as={Link} to="/AdminHome" className="text-light py-2">
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
            <Nav.Link as={Link} to="/ManageCar" className="text-light py-2">
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
          <Container>
            {/* Display Error if Fetch Fails */}
            {fetchError && <p className="text-danger text-center">{fetchError}</p>}

            {/* Car Gallery */}
            <h2 className="text-center mb-4">Available Cabs</h2>
            <div className="d-flex flex-wrap justify-content-center">
              {carList.length === 0 ? (
                <p>No cars available.</p>
              ) : (
                carList.map((car, index) => (
                  <Card key={index} className="m-2 shadow" style={{ width: "18rem" }}>
                    <Card.Img
                      variant="top"
                      src={car.photo}
                      alt="Car"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body>
                      <Card.Title>{car.model}</Card.Title>
                      <Card.Text>
                        <strong>License Plate:</strong> {car.licensePlate} <br />
                        <strong>Seats:</strong> {car.seats} <br />
                        <strong>Capacity:</strong> {car.capacity} <br />
                        <strong>Price per KM:</strong> ${car.pricePerKm} <br />
                        <strong>Status:</strong>{" "}
                        {car.status === "0" ? "Available" : "Not Available"}
                      </Card.Text>
                      <Button
                        variant="warning"
                        className="me-2"
                        onClick={() => openEditModal(car)}
                      >
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => removeCar(car.id)}>
                        Delete
                      </Button>
                    </Card.Body>
                  </Card>
                ))
              )}
            </div>
          </Container>

          {/* Edit Car Modal */}
          <Modal show={isEditModalOpen} onHide={() => setIsEditModalOpen(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Car Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {carToEdit && (
                <Form onSubmit={saveCarChanges}>
                  <Form.Group className="mb-3">
                    <Form.Label>Model</Form.Label>
                    <Form.Control
                      type="text"
                      name="model"
                      value={carToEdit.model}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>License Plate</Form.Label>
                    <Form.Control
                      type="text"
                      name="licensePlate"
                      value={carToEdit.licensePlate}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Seats</Form.Label>
                    <Form.Control
                      type="number"
                      name="seats"
                      value={carToEdit.seats}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Capacity</Form.Label>
                    <Form.Control
                      type="number"
                      name="capacity"
                      value={carToEdit.capacity}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Price per KM</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="pricePerKm"
                      value={carToEdit.pricePerKm}
                      onChange={handleEditInputChange}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </Form>
              )}
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;