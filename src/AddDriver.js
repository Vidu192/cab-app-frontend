import React, { useState, useEffect } from "react";
import { Container, Button, Form, Alert, Row, Col, Nav, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

function AdminHome() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phonenumber: "",
    password: "",
    userrole: 1,
    status: 0,
  });

  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fetchError, setFetchError] = useState(null);


  useEffect(() => {
    fetchDrivers();
  }, []);

  // Fetch driver list
  const fetchDrivers = async () => {
    try {
      const response = await fetch("http://localhost:8080/users/all");
      if (!response.ok) throw new Error("Failed to load drivers");
      const data = await response.json();
      setDrivers(data.filter((user) => user.userrole === 1));

    } catch (err) {
      setFetchError("Failed to load drivers");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission (Add Driver)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate input fields
    if (!formData.username || !formData.email || !formData.phonenumber || !formData.password) {
      setError("All fields are required.");
      return;
    }

    // Check for duplicate email (case-insensitive)
    if (drivers.some((driver) => driver.email.toLowerCase() === formData.email.toLowerCase())) {
      setError("Email already exists.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/users/staffregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add driver");

      setSuccess("Driver added successfully!");
      setFormData({ username: "", email: "", phonenumber: "", password: "", userrole: 1, status: 0 });
      fetchDrivers(); // Refresh driver list
      setShowModal(false); // Close the modal
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
          <h2 className="text-center mb-4">Manage Drivers</h2>

          {/* Display Error or Success Messages */}
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}
          {success && <Alert variant="success" className="text-center">{success}</Alert>}

          {/* Button to Open Add Driver Modal */}
          <div className="d-flex justify-content-end mb-4">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Add Driver
            </Button>
          </div>

          {/* Driver List Table */}
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="bg-dark text-white">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td>{driver.id}</td>
                    <td>{driver.username}</td>
                    <td>{driver.email}</td>
                    <td>{driver.phonenumber}</td>
                    <td>
                      <span className={driver.status === 0 ? "text-success" : "text-danger"}>
                        {driver.status === 0 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No drivers found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Add Driver Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Add New Driver</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phonenumber"
                    value={formData.phonenumber}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Add Driver
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