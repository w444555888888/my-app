/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 20:24:17
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-27 18:54:52
 * @FilePath: \my-app\src\App.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect } from 'react'
import "./app.scss"
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers, axiosHotels } from './redux/userSlice'
import Home from "./pages/Home"
import HotelsList from "./pages/HotelsList"
import Hotel from "./pages/Hotel"
import SignUp from "./pages/SignUp"
import LogIn from "./pages/LogIn"
import Forgot from "./pages/Forgot"
import Personal from "./pages/Personal"


function App () {
  const dispatch = useDispatch()
  const { isLoggedIn } = useSelector((state) => state.user)





  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(axiosHotels())
  }, [dispatch])

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<PrivateRoute isLoggedIn={isLoggedIn}><Home /></PrivateRoute>} />

          <Route path="/signUp" element={<SignUp />} />

          <Route path="/logIn" element={<LogIn />} />

          <Route path="/forgot" element={<Forgot />} />

          <Route path="/hotelsList" element={<PrivateRoute isLoggedIn={isLoggedIn}><HotelsList /></PrivateRoute>} />

          <Route path="/hotel/:id" element={<PrivateRoute isLoggedIn={isLoggedIn}><Hotel /></PrivateRoute>} />

          <Route path="/personal" element={<PrivateRoute isLoggedIn={isLoggedIn}><Personal /></PrivateRoute>} />
        </Routes>
      </Router>
    </div>
  )
}

const PrivateRoute = ({ children, isLoggedIn }) => {
  return isLoggedIn ? children : <Navigate to="/logIn" replace />
}



export default App
