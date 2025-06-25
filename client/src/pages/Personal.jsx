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
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux'
import { logOut } from '../redux/userStore'
import { request } from '../utils/apiService'
import { toast } from 'react-toastify'
import EmptyState from '../subcomponents/EmptyState'
const Personal = () => {
  const dispatch = useDispatch()
  const userInfo = useSelector((state) => state.user.userInfo)
  const navigate = useNavigate()
  // localStroge
  const userName = localStorage.getItem('username')
  const userDetails = JSON.parse(userName)
  const username = userDetails.username
  const email = userDetails.email

  // useState
  const [orders, setOrders] = useState([])
  const [flightOrders, setFlightOrders] = useState([])
  const [password, setPassword] = useState('')
  const [realName, setRealName] = useState(userDetails.realName || '')
  const [phoneNumber, setPhoneNumber] = useState(userDetails.phoneNumber || '')
  const [address, setAddress] = useState(userDetails.address || '')
  const [loading, setLoading] = useState('')


  const handleClickToHome = () => {
    navigate('/')
  }

  // 編輯帳戶
  const handleEdit = async (e) => {
    e.preventDefault()
    const result = await request('PUT', `/users/${userDetails._id}`, { password: password, realName: realName, phoneNumber: phoneNumber, address: address }, setLoading)
    if (result.success) {
      const data = result.data;
      localStorage.setItem('username', JSON.stringify(data));
      toast.success('編輯帳戶成功！');
    } else toast.error(`${result.message}`)
  }



  // 登出
  const handleClicklogOut = () => {
    if (window.confirm('確定登出?')) {
      dispatch(logOut())
      navigate('/login')
    }
  }


  useEffect(() => {
    const fetchUserData = async () => {
      const result = await request('GET', `/users/${userDetails._id}`);
      if (result.success) {
        const data = result.data;
        setOrders(data.allOrder || []);
        setFlightOrders(data.allFightOrder || []);
      } else toast.error(`${result.message}`)
    };
    fetchUserData();
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
            <label htmlFor="realName">Real Name:</label>
            <input
              type="text"
              id="realName"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
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

      </div>
      <div className="personalContainer">
        <h2>My Orders</h2>
        <div className="orderList">
          {orders.length === 0 ? (
            <EmptyState title="無訂房訂單" />
          ) : (
            orders.map((order) => (
              <div key={order._id} className="orderItem">
                <div className="orderHeader">
                  <span>訂單編號: {order._id}</span>
                  <span>狀態: {
                    order.status === 'pending' ? '支付中' :
                      order.status === 'confirmed' ? '已確認' :
                        order.status === 'cancelled' ? '已取消' :
                          order.status === 'completed' ? '已完成' :
                            ''
                  }</span>
                </div>
                <div className="orderDetails">
                  <p>入住日期: {new Date(order.checkInDate).toLocaleDateString()}</p>
                  <p>退房日期: {new Date(order.checkOutDate).toLocaleDateString()}</p>
                  <p>總價: ${order.totalPrice}</p>
                  <p>支付方式: {
                    order.payment.method === 'credit_card' ? '信用卡' :
                      order.payment.method === 'paypal' ? 'PayPal' :
                        order.payment.method === 'bank_transfer' ? '銀行轉帳' :
                          order.payment.method === 'on_site_payment' ? '現場支付' :
                            ''
                  }</p>

                  <p>支付狀態: {
                    order.payment.status === 'pending' ? '支付中' :
                      order.payment.status === 'paid' ? '已支付' :
                        order.payment.status === 'failed' ? '支付失敗' :
                          order.payment.status === 'refunded' ? '已退款' :
                            ''
                  }</p>

                </div>
              </div>
            )))
          }
        </div>
      </div>
      <div className="personalContainer">
        <h2>My Flight Orders</h2>
        <div className="orderList">
          {flightOrders.length === 0 ? (
            <EmptyState title="無航班訂單" />
          ) : (
            flightOrders.map((order) => (
              <div key={order._id} className="orderItem">
                <div className="orderHeader">
                  <span>訂單編號: {order.orderNumber}</span>
                  <span>狀態: {
                    order.status === 'PENDING' ? '待處理' :
                      order.status === 'CONFIRMED' ? '已確認' :
                        order.status === 'CANCELLED' ? '已取消' :
                          order.status === 'COMPLETED' ? '已完成' : ''
                  }</span>
                </div>
                <div className="orderDetails">
                  <p>出發日期: {new Date(order.departureDate).toLocaleDateString()}</p>
                  <p>艙等: {
                    order.category === 'ECONOMY' ? '經濟艙' :
                      order.category === 'BUSINESS' ? '商務艙' :
                        order.category === 'FIRST' ? '頭等艙' : ''
                  }</p>
                  <p>基本票價: ${order.price.basePrice}</p>
                  <p>稅金: ${order.price.tax}</p>
                  <p>總價: ${order.price.totalPrice}</p>
                  <div className="passengerInfo">
                    <p>乘客資訊</p>
                    {order.passengerInfo.map((passenger, index) =>
                    (
                      <div key={passenger._id} className="passenger">
                        <p>乘客 {index + 1}</p>
                        <p data-label="姓名">{passenger.name}</p>
                        <p data-label="性別">{passenger.gender}</p>
                        <p data-label="出生年月日">{new Date(passenger.birthDate).toLocaleDateString()}</p>
                        <p data-label="護照號碼">{passenger.passportNumber}</p>
                        <p data-label="E-mail">{passenger.email}</p>
                      </div>
                    ))
                    }
                  </div>
                </div>
              </div>
            )))}
        </div>
      </div>
    </div>
  )
}

export default Personal
