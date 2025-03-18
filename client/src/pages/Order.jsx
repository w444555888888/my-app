
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
import Skeleton from 'react-loading-skeleton';
import { MdFreeBreakfast } from "react-icons/md"

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

  const OrderSkeleton = () => (
    <div className='order'>
      <Navbar />
      <div className="order-container">
        <div className="order-wrapper">
          <Skeleton height={50} className="mb-4" />
          <div className="hotel-info">
            <Skeleton height={40} width={300} className="mb-2" />
            <Skeleton height={20} width={200} className="mb-2" />
            <Skeleton height={30} width={60} />
          </div>
          <div className="booking-info">
            <Skeleton height={30} width={150} className="mb-3" />
            <div className="dates">
              <Skeleton height={100} width="45%" className="mr-4" />
              <Skeleton height={100} width="45%" />
            </div>
            <Skeleton height={80} className="mt-3" />
          </div>
          <div className="price-details">
            <Skeleton height={30} width={150} className="mb-3" />
            <Skeleton height={50} />
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentHotel || !selectedRoom) return <OrderSkeleton />;

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
              <div className="hotel-name">{currentHotel.name}</div>
              <p className="address">{currentHotel.address}</p>
              <div className="inform">
                <span className="inform-item">Email: {currentHotel.email}</span>
                <span className="inform-item">Tel: {currentHotel.phone}</span>
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
                <div className="room-title">已選擇：</div>
                <div className="room-info">
                  <div className="room-people">
                    {selectedRoom.title} ({selectedRoom.maxPeople} 位成人)
                  </div>
                  {selectedRoom.breakFast && (
                    <div className="breakfast-info">
                      <MdFreeBreakfast className="breakfast-icon" />
                      <span>含早餐</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 價格明細 */}
            <div className="price-details">
              <div className="price-title">房價明細</div>
              <div className="total-price">
                <span>付款方式</span>
                <div className="booking-policies">
                  {selectedRoom.paymentOptions.map(policy => (
                    <div key={policy._id} className="policy-item">
                      <div className="policy-type">{policy.type}</div>
                      <div className="policy-description">{policy.description}</div>
                      <div className="policy-payment">付款方式：{policy.paymentMethod}</div>
                      <div className="policy-refund">
                        {policy?.refundable ? '可退款' : '不可退款'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="price-summary">
                  <span>總金額</span>
                  <span className="price">TWD {selectedRoom.roomTotalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default Order