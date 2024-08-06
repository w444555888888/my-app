/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 21:04:23
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-06 18:49:53
 * @FilePath: \my-app\src\pages\Personal.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './personal.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleRight } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import { logOut } from '../redux/userSlice'
import axios from 'axios'

const Personal = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // useState
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  // localStroge
  const localStrogeToUsername = localStorage.getItem('username')
  const userDetails = JSON.parse(localStrogeToUsername)
  const username = userDetails.username
  const email = userDetails.email

  const handleClickToHome = () => {
    navigate('/')
  }

  // 編輯帳戶
  const handleEdit = async (event) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/users/${userDetails._id}`, { password: password, address: address, phoneNumber: phoneNumber })
      navigate('/')
    } catch (error) {
      console.error('Error:', error)
      setMessage(error.response.data.Message)
    }
  }



  // 登出
  const handleClicklogOut = () => {
    if (window.confirm('確定登出?')) {
      dispatch(logOut())
      navigate('/login')
    }
  }


  // useEffect
  useEffect(() => {

  }, [dispatch])

  return (
    <div className="personalWrapper">
      <div className="personalContainer">
        <div className="personalTitle">
          <div className="left">
            <span className="logo">MIKE.BOOKING</span>
          </div>
          <div className="right">
            <div className="navButton" onClick={handleClickToHome}>
              <FontAwesomeIcon icon={faCircleRight} />
            </div>
          </div>
        </div>
      </div>
      <div className="personalContainer">
        <h2>Personalize</h2>
        <form >
          <div className="formGroup">
            <label htmlFor="email">E-mail:</label>
            <input type="email" id="email" value={email} required disabled />
          </div>
          <div className="formGroup">
            <label htmlFor="username">Username:</label>
            <input id="username" value={username} required disabled />
          </div>
          <div className="formGroup">
            <label htmlFor="password">Change Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="formGroup">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="formGroup">
            <label htmlFor="address">Address:</label>
            <input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <button type='submit' onClick={handleEdit}>Confirm Edit</button>
          <button onClick={handleClicklogOut} >Log Out</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  )
}

export default Personal
