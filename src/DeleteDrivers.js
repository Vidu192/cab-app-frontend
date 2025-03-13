import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert, Nav, Row, Col } from "react-bootstrap"; // Added Row, Col
import { Link } from "react-router-dom";

const RemoveDrivers = () => {
  const [driverList, setDriverList] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  // Fetch all drivers
  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const response = await fetch("http://localhost:8080/users/all");
      if (!response.ok) throw new Error("Failed to load drivers");
      const data = await response.json();
      setDriverList(data.filter((user) => user.userrole === 1));
    } catch (err) {
      setFetchError("Failed to load drivers");
    }
  };

  // Delete a driver
  const deleteDriver = async (driverId) => {
    if (window.confirm("Are you sure you want to remove this driver?")) {
      try {
        const response = await fetch(`http://localhost:8080/users/delete/${driverId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to remove driver");

        setDeleteSuccess("Driver removed successfully!");
        loadDrivers(); // Refresh the list after deletion
      } catch (error) {
        setFetchError(error.message);
      }
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
          <Container>
            <h1 className="mb-4">Manage Drivers</h1>

            {/* Display Messages */}
            {fetchError && <Alert variant="danger">{fetchError}</Alert>}
            {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}

            {/* Drivers Table */}
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {driverList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No drivers available.
                    </td>
                  </tr>
                ) : (
                  driverList.map((driver, index) => (
                    <tr key={driver.id}>
                      <td>{index + 1}</td>
                      <td>{driver.username}</td>
                      <td>{driver.email}</td>
                      <td>{driver.phonenumber}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteDriver(driver.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default RemoveDrivers;