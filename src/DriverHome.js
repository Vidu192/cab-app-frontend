import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function DriverDashboard() {
  const driverId = localStorage.getItem("userId");
  const [rides, setRides] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [confirmedRides, setConfirmedRides] = useState(new Set()); // Track confirmed rides

  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) => setRides(data))
      .catch((error) => console.error("Error fetching rides:", error));
  }, []);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (rides.length === 0) return;
      const vehicleIds = [...new Set(rides.map((r) => r.carid))];
      const newVehicleIds = vehicleIds.filter((id) => !vehicles[id]);
      if (newVehicleIds.length === 0) return;
      setLoadingVehicles(true);
      const vehicleData = {};

      await Promise.all(
        newVehicleIds.map(async (carid) => {
          try {
            const response = await fetch(`http://localhost:8080/cars/${carid}`);
            if (!response.ok) throw new Error("Failed to fetch vehicle data");
            const data = await response.json();
            vehicleData[carid] = data;
          } catch (error) {
            console.error(`Error fetching vehicle details for carid ${carid}:`, error);
          }
        })
      );

      setVehicles((prevVehicles) => ({ ...prevVehicles, ...vehicleData }));
      setLoadingVehicles(false);
    };

    fetchVehicleDetails();
  }, [rides]);

  const handleCancelRide = async (rideId) => {
    try {
      const response = await fetch(`http://localhost:8080/bookings/update/${rideId}/status2`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update ride status");
      setRides((prevRides) =>
        prevRides.map((ride) => (ride.id === rideId ? { ...ride, bookstatus: 2 } : ride))
      );
      alert(`Ride ${rideId} has been cancelled.`);
    } catch (error) {
      console.error("Error updating ride status:", error);
      alert("Failed to cancel ride. Try again.");
    }
  };

  const handleConfirmRide = async (rideId) => {
    try {
      // Step 1: Update the ride status to "In Progress" (status 1)
      const updateResponse = await fetch(`http://localhost:8080/bookings/update/${rideId}/status1`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!updateResponse.ok) throw new Error("Failed to update ride status");

      // Step 2: Mark the ride as confirmed temporarily
      setConfirmedRides((prev) => new Set(prev).add(rideId));

      // Step 3: Delete the ride from the database
      const deleteResponse = await fetch(`http://localhost:8080/bookings/${rideId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!deleteResponse.ok) throw new Error("Failed to delete ride");

      // Step 4: Remove the ride from the local state after a short delay (for UX)
      setTimeout(() => {
        setRides((prevRides) => prevRides.filter((ride) => ride.id !== rideId));
        setConfirmedRides((prev) => {
          const newSet = new Set(prev);
          newSet.delete(rideId);
          return newSet;
        });
      }, 2000); // 2-second delay to show "Booking Confirmed"

      alert(`Ride ${rideId} is confirmed and will be removed from the database.`);
    } catch (error) {
      console.error("Error handling ride confirmation:", error);
      alert("Booking Conform successfull");
    }
  };

  const filteredRides = rides.filter(
    (ride) => String(ride.driverid) === driverId && ride.bookstatus !== 2
  );

  return (
    <Row className="m-0">
      {/* Sidebar */}
      <Col md={2} className="bg-dark min-vh-100 p-3">
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/" className="text-white mb-3 fw-bold">
            Cab Management System
          </Nav.Link>
          <Nav.Link as={Link} to="/" className="text-danger py-2 mt-3 fw-bold">
            Logout
          </Nav.Link>
        </Nav>
      </Col>

      {/* Main Content */}
      <Col md={10}>
        <Container>

          <h4 className="text-center mb-4">  Driver Dashboard</h4>
        <h4 className="text-center mb-4" style={{ display: "none" }}>
  Your Driver ID: {driverId || "Not Available"}
</h4>

          <Row>
            {filteredRides.length > 0 ? (
              filteredRides.map((ride) => {
                const vehicle = vehicles[ride.carid];
                return (
                  <Col key={ride.id} md={4} className="mb-4">
                    {confirmedRides.has(ride.id) ? (
                      <Card className="shadow-sm border-0 text-center">
                        <Card.Body>
                          <Card.Title>Booking Confirmed</Card.Title>
                        </Card.Body>
                      </Card>
                    ) : (
                      <Card className="shadow-sm border-0">
                        {vehicle && vehicle.photo ? (
                          <Card.Img
                            variant="top"
                            src={
                              vehicle.photo.startsWith("data:image")
                                ? vehicle.photo
                                : `data:image/jpeg;base64,${vehicle.photo}`
                            }
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                        ) : (
                          <Spinner animation="border" className="mx-auto my-4" />
                        )}
                        <Card.Body>
                          <Card.Title>Ride ID: {ride.id}</Card.Title>
                          <Card.Text>
                            <strong>Car:</strong> {vehicle ? vehicle.model : "Loading..."} <br />
                            <strong>Location:</strong> {ride.location} <br />
                            <strong>Time:</strong> {ride.time} <br />
                            <strong>Status:</strong>{" "}
                            <span
                              className={
                                ride.bookstatus === 0
                                  ? "text-warning"
                                  : ride.bookstatus === 1
                                  ? "text-primary"
                                  : "text-danger"
                              }
                            >
                              {ride.bookstatus === 0
                                ? "Pending"
                                : ride.bookstatus === 1
                                ? "In Progress"
                                : "Cancelled"}
                            </span>
                            <br />
                            <strong>Total Fee:</strong> ${ride.totalfee ? ride.totalfee.toFixed(2) : "N/A"} <br />
                            <strong>Payment Status:</strong>{" "}
                            <span className={ride.paymentstatus === 0 ? "text-danger" : "text-success"}>
                              {ride.paymentstatus === 0 ? "Unpaid" : "Paid"}
                            </span>
                          </Card.Text>
                          <div className="d-flex justify-content-between">
                            <Button variant="success" onClick={() => handleConfirmRide(ride.id)}>
                              Confirm
                            </Button>
                            <Button variant="danger" onClick={() => handleCancelRide(ride.id)}>
                              Cancel
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </Col>
                );
              })
            ) : (
              <p className="text-center">No rides found</p>
            )}
          </Row>
        </Container>
      </Col>
    </Row>
  );
}

export default DriverDashboard;