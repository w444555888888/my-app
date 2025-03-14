
// 
// const userInfo = JSON.parse(localStorage.getItem('username'));
// const selectedRoom = rooms.find(room => room._id === roomId);
// const result = await request('POST', '/order', {
//   hotelId: hotelIdRouter,
//   roomId: roomId,
//   checkInDate: startDateRouter,
//   checkOutDate: endDateRouter,
//   userId: userInfo._id,
//   totalPrice: selectedRoom.roomTotalPrice 
// });

import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { format } from "date-fns";
import "./order.scss"

const Order = () => {
  const { startDate, endDate, hotelId, roomId } = useParams();
  const { currentHotel, availableRooms } = useSelector(state => state.hotel);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (availableRooms && roomId) {
      const room = availableRooms.find(room => room._id === roomId);
      setSelectedRoom(room);
    }
  }, [availableRooms, roomId]);

  if (!currentHotel || !selectedRoom) return <div>載入中...</div>;

  return (
    <div className='order'>
      <Navbar />
      <div className="order-container">
        <div className="order-wrapper">
          <div className="progress-step">
          </div>

          {/* 訂單內容區域 */}
          <div className="order-content">
            <div className="hotel-info">
              <h2>{currentHotel.name}</h2>
              <p className="address">{currentHotel.address}</p>
              <div className="rating">
                <span className="score">{currentHotel.rating}</span>
              </div>
            </div>
         

          {/* 訂房信息 */}
          <div className="booking-info">
            <h3>您的訂房資訊</h3>
            <div className="dates">
              <div className="check-in">
                <h4>入住時間</h4>
                <p>{format(new Date(startDate), "yyyy 年 MM 月 dd 日")}</p>
                <p>下午3:00 - 下午6:00</p>
              </div>
              <div className="check-out">
                <h4>退房時間</h4>
                <p>{format(new Date(endDate), "yyyy 年 MM 月 dd 日")}</p>
                <p>上午11:00前</p>
              </div>
            </div>
            <div className="room-details">
              <h4>已選擇：</h4>
              <p>{selectedRoom.title} ({selectedRoom.maxPeople} 位成人)</p>
            </div>
          </div>

          {/* 價格明細 */}
          <div className="price-details">
            <h3>房價明細</h3>
            <div className="total-price">
              <span>總金額</span>
              <span className="price">TWD {selectedRoom.roomTotalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div >
  )
}

export default Order