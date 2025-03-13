import React, { useEffect, useState } from "react";
import { Container, Card, Button, Row, Col, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function BookingManagement() {
  const [reservations, setReservations] = useState([]);
  const [vehicleDetails, setVehicleDetails] = useState({});
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Fetch all reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("http://localhost:8080/bookings/all");
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };
    fetchReservations();
  }, []);

  // Fetch vehicle details for relevant car IDs
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (reservations.length === 0) return;
      const carIdList = [...new Set(reservations.map((r) => r.carid))];
      const newCarIds = carIdList.filter((id) => !vehicleDetails[id]);
      if (newCarIds.length === 0) return;

      setLoadingVehicles(true);
      const carData = {};
      await Promise.all(
        newCarIds.map(async (carid) => {
          try {
            const response = await fetch(`http://localhost:8080/cars/${carid}`);
            if (!response.ok) throw new Error("Failed to fetch car data");

            const data = await response.json();
            carData[carid] = data;
          } catch (error) {
            console.error(`Error fetching vehicle details for car ID ${carid}:`, error);
          }
        })
      );
      setVehicleDetails((prevData) => ({ ...prevData, ...carData }));
      setLoadingVehicles(false);
    };
    fetchVehicleDetails();
  }, [reservations]);

  // Cancel a reservation
  const cancelReservation = async (reservationId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const response = await fetch(`http://localhost:8080/rental/delete/${reservationId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to cancel booking");
      alert("Booking canceled successfully!");
      setReservations(reservations.filter((reservation) => reservation.id !== reservationId));
    } catch (error) {
      console.error("Error canceling reservation:", error);
      alert("Failed to cancel booking.");
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
        <Col md={10} className="mt-4">
          <h2 className="text-center mb-4">Admin - All Reservations</h2>
          {reservations.length > 0 ? (
            <Row>
              {reservations.map((reservation) => {
                const vehicle = vehicleDetails[reservation.carid];
                return (
                  <Col key={reservation.id} md={4} sm={6} xs={12} className="mb-4">
                    <Card className="shadow-sm">
                      {vehicle?.photo ? (
                        <Card.Img
                          variant="top"
                          src={
                            vehicle.photo.startsWith("data:image")
                              ? vehicle.photo
                              : `data:image/jpeg;base64,${vehicle.photo}`
                          }
                          alt={vehicle.model}
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="text-center py-5 bg-light">No Image Available</div>
                      )}
                      <Card.Body>
                        <Card.Title>{vehicle ? vehicle.model : "Vehicle Details Loading..."}</Card.Title>
                        <Card.Text>
                          <strong>Reservation ID:</strong> {reservation.id} <br />
                          <strong>User ID:</strong> {reservation.userid} <br />
                          <strong>Pickup Location:</strong> {reservation.location} <br />
                          <strong>Pickup Time:</strong> {reservation.time} <br />
                          <strong>Total Cost:</strong> ${reservation.totalfee?.toFixed(2) || "N/A"} <br />
                          <strong>Payment Status:</strong>
                          <span className={reservation.paymentstatus === 0 ? "text-danger" : "text-success"}>
                            {reservation.paymentstatus === 0 ? "Unpaid" : "Paid"}
                          </span>
                        </Card.Text>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => cancelReservation(reservation.id)}
                        >
                          Cancel Reservation
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <p className="text-center">No reservations found</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default BookingManagement;