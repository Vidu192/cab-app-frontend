import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert, Nav, Row, Col } from "react-bootstrap"; // Added Row, Col
import { Link } from "react-router-dom";

const RemoveUsers = () => {
  const [userList, setUserList] = useState([]); // Stores all users with role 2 (Customers)
  const [fetchError, setFetchError] = useState(""); // Stores any fetch error message

  // Fetch all users with role 2 (Customers)
  const getUsers = () => {
    fetch("http://localhost:8080/users/all")
      .then((response) => response.json())
      .then((data) => setUserList(data.filter((user) => user.userrole === 2)))
      .catch(() => setFetchError("Failed to fetch users"));
  };

  useEffect(() => {
    getUsers(); // Fetch users when component mounts
  }, []);

  // Delete a user
  const deleteUser = (userId) => {
    const confirmDeletion = window.confirm("Are you sure you want to remove this user?");
    
    if (!confirmDeletion) return; // Stop if user cancels
  
    fetch(`http://localhost:8080/users/delete/${userId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete user");
        }
        setUserList(userList.filter((user) => user.id !== userId));
      })
      .catch(() => setFetchError("Failed to delete user"));
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
            <h1 className="mb-4">Manage Users</h1>

            {fetchError && <Alert variant="danger">{fetchError}</Alert>}

            {/* Users Table */}
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
                {userList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No users available.
                    </td>
                  </tr>
                ) : (
                  userList.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.phonenumber}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
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

export default RemoveUsers;