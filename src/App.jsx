import React, { useState, useEffect } from 'react';
import "./app.scss"
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from "./pages/Home";
import HotelsList from "./pages/HotelsList";
import Hotel from "./pages/Hotel";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Forgot from "./pages/Forgot";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('username'));

  useEffect(() => {
    const username = localStorage.getItem('username');
    setIsLoggedIn(!!username);
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<PrivateRoute isLoggedIn={isLoggedIn}><Home /></PrivateRoute>} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/logIn" element={<LogIn setIsLoggedIn={setIsLoggedIn}/>} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/hotelsList" element={<PrivateRoute isLoggedIn={isLoggedIn}><HotelsList /></PrivateRoute>} />
          <Route path="/hotels/:id" element={<PrivateRoute isLoggedIn={isLoggedIn}><Hotel /></PrivateRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

const PrivateRoute = ({ children, isLoggedIn }) => {
  return isLoggedIn ? children : <Navigate to="/logIn" replace />;
};



export default App;
