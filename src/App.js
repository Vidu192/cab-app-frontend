import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthPage from "./AuthPage";
import AdminHome from "./AdminHome";
import DriverHome from "./DriverHome";
import CustomerHomePage from "./CustomerHomePage";
import ViewBookings from "./ViewBookings";
import UserActiveBookings from "./UserActiveBookings";
import ManageCar from "./ManageCar";
import AddDriver from "./AddDriver";
import DeleteDrivers from "./DeleteDrivers";
import DeleteUsers from "./DeleteUsers";
import ManageBookings from "./ManageBookings";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/driver" element={<DriverHome />} />
        <Route path="/customer" element={<CustomerHomePage />} />
        <Route path="/ViewBookings" element={<ViewBookings />} />
        <Route path="/UserActiveBookings" element={<UserActiveBookings />} />
        <Route path="/ManageCar" element={<ManageCar />} />
        <Route path="/AdminHome" element={<AdminHome />} />
        <Route path="/AddDriver" element={<AddDriver />} />
        <Route path="/DeleteDrivers" element={<DeleteDrivers />} />
        <Route path="/DeleteUsers" element={<DeleteUsers />} />
        <Route path="/ManageBookings" element={<ManageBookings />} />
        
    
        
      </Routes>
    </Router>
  );
}

export default App;
