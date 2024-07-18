/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 21:04:23
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-19 00:07:01
 * @FilePath: \my-app\src\pages\Personal.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './personal.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleRight } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers } from '../redux/userSlice'

const Personal = ({ setIsLoggedIn }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // useState
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')

  // redux
  const username = localStorage.getItem('username')
  const { users, status } = useSelector((state) => state.user)
  const user = users.find((e) => e.username === username)

  // useEffect
  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      const passwordLength = user.password ? user.password.length : 0;
      const starPassword = '*'.repeat(passwordLength);
      setPassword(starPassword)
      setPhoneNumber(user.phoneNumber || '')
      setAddress(user.address || '')
    }
  }, [user])


  const handleClickToHome = () => {
    navigate('/')
  }

  const handleEdit = async (event) => {
    event.preventDefault()
    try {
      if (user) {
        const updatedUser = {
          ...user,
          password: password,
          phoneNumber: phoneNumber,
          address: address,
        }

        const updateResponse = await fetch(`http://localhost:3000/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUser),
        })

        if (updateResponse.ok) {
          setMessage('修改完成')
        } else {
          setMessage('更新失敗，請重新修改')
        }
      } else {
        setMessage('帳號密碼輸出錯誤，請重新輸入')
      }
    } catch (error) {
      setMessage('稍後再試')
    }
  }


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
        <form onSubmit={handleEdit}>
          <div className="formGroup">
            <label htmlFor="email">E-mail:</label>
            <input type="email" id="email" value={username} required disabled />
          </div>
          <div className="formGroup">
            <label htmlFor="password">change password:</label>
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
          <button type="submit">Confirm Edit</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  )
}

export default Personal
