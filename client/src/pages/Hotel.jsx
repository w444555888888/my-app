import { faLocationDot, faPeopleGroup, faSmokingBan, faWifi, faXmark, faAngleLeft, faAngleRight, faUserLarge, faCheck } from '@fortawesome/free-solid-svg-icons'
import { IoBed } from "react-icons/io5"
import { MdFreeBreakfast } from "react-icons/md"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useRef, useState, useEffect } from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { gsap } from "gsap"
import "./hotel.scss"
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'


const Hotel = () => {
  // modal
  const [openSlider, setOpenSlider] = useState(false)
  const [sliderIndex, setSiderIndex] = useState(0)
  const [rooms, setRooms] = useState([])
  const comments = useRef(null)

  // 路由傳遞資料
  const location = useLocation()


  useEffect(() => {
    const axiosRooms = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/rooms/findHotel/${location.state.hotel._id}`)
        setRooms(response.data)
      } catch (error) {
        console.error('Error fetching hotels:', error)
      }
    }

    axiosRooms()
  }, [location])


  const handleHover = () => {
    gsap.to(comments.current, {
      css: {
        display: "flex",
        opacity: 1,
      },
      ease: "strong.inOut"
    })
  }

  const handleHoverExit = () => {
    gsap.to(comments.current, {
      css: {
        display: "none",
        opacity: 0,
      },
      ease: "strong.inOut"
    })
  }


  const clickSlider = (index) => {
    setOpenSlider(true)
    setSiderIndex(index)
  }

  const slideDirection = (direction) => {
    let newSliderIndex
    let lastPicutre = location.state.hotel.photos.length - 1
    if (direction === "left") {
      sliderIndex === 0 ? newSliderIndex = lastPicutre : newSliderIndex = sliderIndex - 1
      setSiderIndex(newSliderIndex)
    } else {
      sliderIndex === lastPicutre ? newSliderIndex = 0 : newSliderIndex = sliderIndex + 1
      setSiderIndex(newSliderIndex)
    }
  }

  return (
    <div className='hotel'>
      <Navbar />
      {openSlider &&
        <div className="slider">
          <div className="sliderWrapper">
            <div className="wrapperTitle">
              <div className='TitleName'>{location.state.hotel.name}</div>
              <span className="CloseSign" onClick={() => setOpenSlider(false)}>關閉
                <FontAwesomeIcon icon={faXmark} /></span>
            </div>
            <div className="wrapperBody">
              <FontAwesomeIcon icon={faAngleLeft} className="arrow" onClick={() => slideDirection("left")} />
              <img src={location.state.hotel.photos[sliderIndex]} />
              <FontAwesomeIcon icon={faAngleRight} className="arrow" onClick={() => slideDirection("right")} />
            </div>
          </div>
        </div>
      }
      <div className="HotelContainer">
        <div className="HotelWrapper">
          <div className="HotelHeaderBtn">
            <button>資訊 & 房價</button>
            <button>設施</button>
            <button>訂房須知</button>
            <button>房客評價</button>
          </div>
          <div className="hotelTitle">
            <div className="titleLeft">
              <span className="type">{location.state.hotel.type}</span>
              <span className='hotelName'>{location.state.hotel.name}</span>
              <span className='recommend'><span className="recommendSvg"><FontAwesomeIcon icon={faPeopleGroup} /></span>推薦四人住宿</span>
              <div className="address"><FontAwesomeIcon icon={faLocationDot} /> {location.state.hotel.address} </div>
            </div>
            <div className="titleRight">
              <button className="reservationBtn">現在就預訂</button>
            </div>
          </div>
          <div className="hotelImgWrapper">
            <div className="popupcomment" onMouseEnter={handleHover} onMouseOut={handleHoverExit}>
              <div className='commentInfo' ref={comments}>
                <button className='commentRate'>{location.state.hotel.rating}</button>
                傑出<br />
                {location.state.hotel.comments}則評論
              </div>
            </div>
            <div className="hotelImg">
              {location.state.hotel.photos.map((e, index) => (
                <div key={index} className="Imgwrap" onClick={() => clickSlider(index)}>
                  <img src={e} key={index} />
                </div>
              ))}
            </div>
          </div>
          <div className="hotelDes">
            <div className="hotelDesText">
              {location.state.hotel.title}
              <br />
              {location.state.hotel.desc}
              <h1>熱門設施</h1>
              <p className='textIcon'><FontAwesomeIcon icon={faWifi} className="wifi" />
                免費無線網路 <FontAwesomeIcon icon={faSmokingBan} />禁菸客房</p>
            </div>
            <div className="hotelDesPrice">
              <h2>住宿特色</h2>
              <h3> 2024/09/15 - 2024/09/20</h3>
              <p>入住 {'1'} 晚的最佳選擇！
                此住宿位於台南評分最高的地區，地理位置評分高達 {location.state.hotel.rating} 分
                深受獨行旅客歡迎</p>
              <h2>TWD {location.state.hotel.cheapestPrice}</h2>
              <button>現在就預訂</button>
            </div>
          </div>
          <hr />
          <div className="roomDes">
            <div className="roomDesText">
              <table>
                <thead>
                  <tr>
                    <th>客房類型</th>
                    <th>住客人數</th>
                    <th>1晚房價</th>
                    <th>訂購須知</th>
                    <th>現在就預定</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((e) => (
                    <tr key={e._id}  className={e._id}>
                      <td>
                        <span className="roomTitle">{e.title}</span>
                        <IoBed /> <br />
                        <span className='bedNumber'>{e.bedNumber}</span><br />
                        {e.desc.map((item, index) => (
                          <span className='desc' key={index}>
                            <FontAwesomeIcon icon={faCheck} className="iconCheck" />
                            {item}
                          </span>
                        ))}</td>
                      <td>
                        {Array.from({ length: e.maxPeople }).map((_, index) => (
                          <FontAwesomeIcon key={index} icon={faUserLarge} />
                        ))}
                      </td>

                      <td className='twd'>$TWD {e.price}<br /> <span>包含稅費與其他費用</span></td>
                      <td>
                        <ul>
                          {e.bookingPolicies.map((policy, index) => (
                            <li key={index}>
                               <strong>{policy.type}</strong>:
                              {index === 0 && (
                                <strong>{policy.refundable === true ? '可退款' : '不可退款'}</strong> 
                              )}<br />
                             
                              <span>{policy.description}</span>
                            </li>
                          ))}
                          <div className='breakFast'>
                            {e.breakFast === true ? (
                              <li>
                                <MdFreeBreakfast className="breakfast-icon" />含早餐
                              </li>
                            ) : null}
                          </div>
                        </ul>

                      </td>
                      <td>
                        <button>現在就預定</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Hotel
