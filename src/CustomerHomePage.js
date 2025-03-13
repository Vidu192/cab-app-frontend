import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Button, Nav, Modal, Form, Col, Row, Dropdown } from "react-bootstrap";
import "./App.css";

const CustomerHomePage = () => {
  const [availableCars, setAvailableCars] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [driverList, setDriverList] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [bookingInfo, setBookingInfo] = useState({
    location: "",
    time: "",
    travelDistance: "",
    pricePerKm: 0,
    totalfee: 0,
  });
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [userIdentifier, setUserIdentifier] = useState("");
  const [pricePerKm, setPricePerKm] = useState(0);

  useEffect(() => {
    setUserIdentifier(localStorage.getItem("userId") || "N/A");
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch("http://localhost:8080/cars/all");
        const data = await response.json();
        setAvailableCars(data);
      } catch (error) {
        console.error("Failed to fetch car data:", error);
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch("http://localhost:8080/users/staff");
        if (!response.ok) throw new Error("Could not retrieve driver information.");
        const result = await response.json();
        setDriverList(result);
      } catch (error) {
        console.error("Error fetching driver details:", error);
      }
    };
    fetchDrivers();
  }, []);

  const handleOpenModal = async (carId) => {
    setSelectedCarId(carId);
    try {
      const response = await fetch(`http://localhost:8080/cars/${carId}`);
      if (!response.ok) throw new Error("Failed to fetch car details");
      const carData = await response.json();
      setPricePerKm(carData.pricePerKm);
      setBookingInfo((prev) => ({ ...prev, pricePerKm: carData.pricePerKm }));
    } catch (error) {
      console.error("Error fetching car price:", error);
    }
    setShowBookingModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingInfo((prev) => {
      const updatedInfo = { ...prev, [name]: value };
      if (name === "travelDistance") {
        updatedInfo.totalfee = pricePerKm * parseFloat(value || 0);
      }
      return updatedInfo;
    });
  };

  const selectDriver = (driverId, driverName) => {
    setAssignedDriver({ id: driverId, name: driverName });
  };

  const processBooking = async (e) => {
    e.preventDefault();
    if (!bookingInfo.location.trim() || !bookingInfo.time.trim() || !assignedDriver) {
      alert("Please fill all required fields.");
      return;
    }

    const bookingData = {
      userid: userIdentifier,
      carid: selectedCarId,
      location: bookingInfo.location,
      time: bookingInfo.time,
      driverid: assignedDriver.id,
      travelDistance: bookingInfo.travelDistance,
      totalfee: bookingInfo.totalfee,
      bookstatus: 0,
      paymentstatus: 0,
    };

    try {
      const response = await fetch("http://localhost:8080/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error("Failed to confirm the booking.");

      alert("Your booking has been successfully placed!");
      setShowBookingModal(false);
      setBookingInfo({ location: "", time: "", travelDistance: "", pricePerKm: 0, totalfee: 0 });
      setAssignedDriver(null);
    } catch (error) {
      console.error("Booking error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const selectedCar = availableCars.find((car) => car.id === selectedCarId);

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

        <Col md={10} className="p-4">
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-dark">Choose Your Ride</h1>
            <p className="text-muted">User ID: {userIdentifier}</p>
          </div>

          <Row xs={1} md={3} className="g-4">
            {availableCars.map((car) => (
              <Col key={car.id}>
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "15px" }}>
                  <Card.Img
                    variant="top"
                    src={
                      car.photo
                        ? car.photo.startsWith("data:image")
                          ? car.photo
                          : `data:image/jpeg;base64,${car.photo}`
                        : "placeholder-image.jpg"
                    }
                    alt={car.model}
                    style={{ height: "180px", objectFit: "cover", borderRadius: "15px 15px 0 0" }}
                  />
                  <Card.Body className="text-center">
                    <Card.Title className="fw-bold">{car.model}</Card.Title>
                    <Card.Text className="text-muted small">
                      {car.seats} Seats • {car.capacity} CC • ${car.pricePerKm}/km
                    </Card.Text>
                    <Button
                      variant="primary"
                      className="w-75 rounded-pill"
                      onClick={() => handleOpenModal(car.id)}
                    >
                      Book Now
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            {availableCars.length === 0 && (
              <Col className="text-center">
                <p className="text-muted">No cars available.</p>
              </Col>
            )}
          </Row>
        </Col>
      </Row>

      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book {selectedCar?.model}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={processBooking}>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={bookingInfo.location}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="time"
                value={bookingInfo.time}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Travel Distance (km)</Form.Label>
              <Form.Control
                type="number"
                name="travelDistance"
                value={bookingInfo.travelDistance}
                onChange={handleInputChange}
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Total Fee: ${bookingInfo.totalfee.toFixed(2)}</Form.Label>
            </Form.Group>

            <Dropdown className="mb-3">
              <Dropdown.Toggle variant="dark">
                {assignedDriver ? `Driver: ${assignedDriver.name} (ID: ${assignedDriver.id})` : "Select a Driver"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {driverList.length > 0 ? (
                  driverList.map((driver) => (
                    <Dropdown.Item 
                      key={driver.id} 
                      onClick={() => selectDriver(driver.id)}
                    >
                      {driver.username} (ID: {driver.id})
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No Drivers Available</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>

            <div className="text-center">
              <Button variant="success" type="submit" className="me-2">
                ✅ Confirm
              </Button>
              <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
                ❌ Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CustomerHomePage;