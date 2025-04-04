/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 20:24:17
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-01-19 17:54:31
 * @FilePath: \my-app\src\App.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from 'react'
import "./app.scss"
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { request } from './utils/apiService';
import Home from "./pages/Home"
import HotelsList from "./pages/HotelsList"
import Hotel from "./pages/Hotel"
import SignUp from "./pages/SignUp"
import LogIn from "./pages/LogIn"
import Forgot from "./pages/Forgot"
import Personal from "./pages/Personal"
import ResetPassword from "./pages/ResetPassword"
import Order from "./pages/Order"
import axios from 'axios'
function App() {
  // 跨域請求cookie
  axios.defaults.withCredentials = true

  const { login } = useSelector((state) => state.user)
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<PrivateRoute login={login}><Home /></PrivateRoute>} />

          <Route path="/signUp" element={<SignUp />} />

          <Route path="/logIn" element={<LogIn />} />

          <Route path="/forgot" element={<Forgot />} />

          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/hotelsList" element={<PrivateRoute login={login}><HotelsList /></PrivateRoute>} />

          <Route path="/hotels" element={<PrivateRoute login={login}><Hotel /></PrivateRoute>} />

          <Route path="/personal" element={<PrivateRoute login={login}><Personal /></PrivateRoute>} />

          <Route path="/order/:startDate/:endDate/:hotelId/:roomId" element={<PrivateRoute login={login}><Order /></PrivateRoute>} />
        </Routes>
      </Router>
    </div>
  )
}

const PrivateRoute = ({ children, login }) => {
  return login ? children : <Navigate to="/logIn" replace />
}



export default App
