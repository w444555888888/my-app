import { faHeartCircleCheck, faLocationDot, faPeopleGroup, faSmokingBan, faWifi, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useRef, useState, useEffect } from 'react'
import Footer from '../components/Footer';
import Navbar from '../components/Navbar'
import { gsap } from "gsap";
import "./hotel.scss"
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { fetchHotelToDetail } from '../redux/userSlice'


const Hotel = () => {
  const [openSlider, setOpenSlider] = useState(false);
  const comments = useRef(null)
  const dispatch = useDispatch()
 

  const hotelDetails = useSelector((state) => state.user)
console.log('====================================');
console.log(hotelDetails,'fetchHotelToDetail');
console.log('====================================');

  useEffect(() => {
    dispatch(fetchHotelToDetail())
  }, [dispatch])

  const handleHover = () => {
    gsap.to(comments.current, {
      css: {
        display: "flex",
        opacity: 1,
      },
      ease: "power3.inOut"
    })
  }

  const handleHoverExit = () => {
    gsap.to(comments.current, {
      css: {
        display: "none",
        opacity: 0,
      },
      ease: "power3.inOut"
    })
  }

  return (
    <div className='hotel'>
      <Navbar />
      {openSlider &&
        <div className="slider">
          <div className="sliderWrapper">
            <div className="wrapperTitle">
              <div className='TitleName'>{'name'}</div>
              <span className="CloseSign" onClick={() => setOpenSlider(false)}>關閉
                <FontAwesomeIcon icon={faXmark} /></span>
            </div>
            <div className="wrapperBody">
           
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
              <span className="type">{'type'}</span>
              <span className='hotelName'>{'name'}</span>
              <span className='recommend'><span className="recommendSvg"><FontAwesomeIcon icon={faPeopleGroup} /></span>推薦四人住宿</span>
              <div className="address"><FontAwesomeIcon icon={faLocationDot} /> {'address'} </div>
            </div>
            <div className="titleRight">
              <button className="reservationBtn">現在就預訂</button>
              <p><FontAwesomeIcon icon={faHeartCircleCheck} /><span>買貴退差價</span></p>
            </div>
          </div>
          <div className="hotelImgWrapper">
            <div className="popupcomment" onMouseEnter={handleHover} onMouseOut={handleHoverExit}>
              <div className='commentInfo' ref={comments}>
                <button className='commentRate'>{'rating'}</button>
                傑出<br />
                {'8'}則評論
              </div>
            </div>
            <div className="hotelImg">
              {/* Add your hotel images here */}
            </div>
          </div>
          <div className="hotelDes">
            <div className="hotelDesText">
              {'title'}
              <br />
              {'desc'}
              <h1>熱門設施</h1>
              <hr />
              <p className='textIcon'><FontAwesomeIcon icon={faWifi} className="wifi" />
                免費無線網路 <FontAwesomeIcon icon={faSmokingBan} />禁菸客房</p>
            </div>
            <div className="hotelDesPrice">
              <h2>住宿特色</h2>
              <h3> 2024/09/15 - 2024/09/20</h3>
              <p>入住 {'1'} 晚的最佳選擇！
                此住宿位於台南評分最高的地區，地理位置評分高達 {'rating'} 分
                深受獨行旅客歡迎</p>
              <h2>TWD {'4990'}</h2>
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
