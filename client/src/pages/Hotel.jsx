import { faLocationDot, faPeopleGroup, faSmokingBan, faWifi, faXmark, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useRef, useState, useEffect } from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { gsap } from "gsap"
import "./hotel.scss"
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHotelToDetail } from '../redux/userSlice'


const Hotel = () => {
  // modal
  const [openSlider, setOpenSlider] = useState(false);
  const [sliderIndex, setSiderIndex] = useState(0);
  const comments = useRef(null)

  // 路由傳遞資料
  const location = useLocation()


  useEffect(() => {

  })

  const clickSlider = (index) => {
    setOpenSlider(true);
    
  }
console.log(comments,'comments');

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

  const slideDirection = (direction) => {
    let newSliderIndex;
    let lastPicutre = location.state.hotel.photos.length - 1
    if (direction === "left") {
      sliderIndex === 0 ? newSliderIndex = lastPicutre: newSliderIndex = sliderIndex - 1

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
            <FontAwesomeIcon icon={faAngleLeft} className="arrow" onClick={()=>slideDirection("left")} />
            <img src={location.state.hotel.photos[sliderIndex]}  />
            <FontAwesomeIcon icon={faAngleRight} className="arrow" onClick={()=>slideDirection("right")}/>
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
                <div key={index} className="Imgwrap" onClick={clickSlider}>
                  <img src={e} key={index}/>
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
              <hr />
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
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Hotel
