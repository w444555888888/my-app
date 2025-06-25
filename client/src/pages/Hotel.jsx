import {
  faLocationDot,
  faPeopleGroup,
  faWifi,
  faGlassMartiniAlt,
  faDumbbell,
  faParking,
  faSwimmer,
  faUtensils,
  faSpa,
  faXmark,
  faAngleLeft,
  faAngleRight,
  faUserLarge,
  faCalendar,
  faCheck,
} from "@fortawesome/free-solid-svg-icons"
import { IoBed } from "react-icons/io5"
import {
  MdFreeBreakfast,
  MdRestaurantMenu,
  MdLocalParking,
} from "react-icons/md"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useRef, useState, useEffect } from "react"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import { request } from "../utils/apiService"
import { gsap } from "gsap"
import "./hotel.scss"
import {
  useLocation,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom"
import { DateRange } from "react-date-range"
import { differenceInDays, format } from "date-fns"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchSingleHotel,
  setCurrentHotel,
  setAvailableRooms,
} from "../redux/hotelStore"
import EmptyState from "../subcomponents/EmptyState"
import LeafletMapPicker from "../components/LeafletMapPicker"
import { toast } from "react-toastify"

const Hotel = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useDispatch()
  const { currentHotel, availableRooms, loading, error } = useSelector(
    (state) => state.hotel
  )
  const [openSlider, setOpenSlider] = useState(false)
  const [sliderIndex, setSiderIndex] = useState(0)
  const [night, setNight] = useState("")
  const comments = useRef(null)

  // 預設日期為今天和一周後
  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)

  // 從 URL 獲取參數
  const hotelId = searchParams.get("hotelId")
  const startDateParam = searchParams.get("startDate")
  const endDateParam = searchParams.get("endDate")

  // 路由傳遞數據
  const [openCalendar, setOpenCalendar] = useState(false)
  const [startDate, setStartDate] = useState(
    startDateParam || format(today, "yyyy-MM-dd")
  )
  const [endDate, setEndDate] = useState(
    endDateParam || format(nextWeek, "yyyy-MM-dd")
  )
  const [dates, setDates] = useState([
    {
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      key: "selection",
    },
  ])

  // 獲取酒店數據
  useEffect(() => {
    dispatch(fetchSingleHotel(searchParams))
  }, [searchParams, dispatch])

  // 晚數
  useEffect(() => {
    setNight(differenceInDays(dates[0].endDate, dates[0].startDate))
  }, [dates])

  const handleDateChange = (item) => {
    setDates([item.selection])
    setStartDate(format(item.selection.startDate, "yyyy-MM-dd"))
    setEndDate(format(item.selection.endDate, "yyyy-MM-dd"))
    if (
      item.selection.startDate &&
      item.selection.endDate &&
      format(item.selection.startDate, "yyyy-MM-dd") !==
      format(item.selection.endDate, "yyyy-MM-dd")
    ) {
      setOpenCalendar(false)
    }
  }

  const handleSearchHotels = () => {
    const params = {}
    if (hotelId) params.hotelId = hotelId
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    setSearchParams(params)
  }

  const handleHover = () => {
    gsap.to(comments.current, {
      css: {
        display: "flex",
        opacity: 1,
      },
      ease: "strong.inOut",
    })
  }

  const handleHoverExit = () => {
    gsap.to(comments.current, {
      css: {
        display: "none",
        opacity: 0,
      },
      ease: "strong.inOut",
    })
  }

  const clickSlider = (index) => {
    setOpenSlider(true)
    setSiderIndex(index)
  }

  const slideDirection = (direction) => {
    let newSliderIndex
    let lastPicutre = currentHotel.photos.length - 1
    if (direction === "left") {
      sliderIndex === 0
        ? (newSliderIndex = lastPicutre)
        : (newSliderIndex = sliderIndex - 1)
      setSiderIndex(newSliderIndex)
    } else {
      sliderIndex === lastPicutre
        ? (newSliderIndex = 0)
        : (newSliderIndex = sliderIndex + 1)
      setSiderIndex(newSliderIndex)
    }
  }

  const handleNavigateToOrder = async (roomId) => {
    navigate(`/order/${startDate}/${endDate}/${hotelId}/${roomId}`)
  }

  const facilitiesList = [
    { key: "bar", icon: faGlassMartiniAlt, label: "酒吧" },
    { key: "gym", icon: faDumbbell, label: "健身房" },
    { key: "parking", icon: faParking, label: "停車場" },
    { key: "pool", icon: faSwimmer, label: "游泳池" },
    { key: "restaurant", icon: faUtensils, label: "餐廳" },
    { key: "spa", icon: faSpa, label: "水療" },
    { key: "wifi", icon: faWifi, label: "免費無線網路" },
  ]

  if (!currentHotel)
    return (
      <div className="empty-state-container">
        <EmptyState
          title="找不到酒店資訊"
          description="很抱歉，我們無法找到相關的酒店資訊"
        />
      </div>
    )

  return (
    <div className="hotel">
      <Navbar />
      {openSlider && (
        <div className="slider">
          <div className="sliderWrapper">
            <div className="wrapperTitle">
              <div className="titleName">{currentHotel.name}</div>
              <span className="closeSign" onClick={() => setOpenSlider(false)}>
                關閉
                <FontAwesomeIcon icon={faXmark} />
              </span>
            </div>
            <div className="wrapperBody">
              <FontAwesomeIcon
                icon={faAngleLeft}
                className="arrow"
                onClick={() => slideDirection("left")}
              />
              <img src={currentHotel.photos[sliderIndex]} />
              <FontAwesomeIcon
                icon={faAngleRight}
                className="arrow"
                onClick={() => slideDirection("right")}
              />
            </div>
          </div>
        </div>
      )}
      <div className="hotelContainer">
        <div className="hotelWrapper">
          <div className="hotelHeaderBtn">
            <button>資訊 & 房價</button>
            <button>設施</button>
            <button>訂房須知</button>
            <button>房客評價</button>
          </div>
          <div className="hotelTitle">
            <div className="titleLeft">
              <span className="type">{currentHotel.type}</span>
              <span className="hotelName">{currentHotel.name}</span>
              <span className="recommend">
                <span className="recommendSvg">
                  <FontAwesomeIcon icon={faPeopleGroup} />
                </span>
                推薦四人住宿
              </span>
              <div className="address">
                <FontAwesomeIcon icon={faLocationDot} /> {currentHotel.address}{" "}
              </div>
            </div>
            <div className="titleRight">
              <button className="reservationBtn">現在就預訂</button>
            </div>
          </div>
          <div className="hotelImgWrapper">
            <div
              className="popupcomment"
              onMouseEnter={handleHover}
              onMouseOut={handleHoverExit}
            >
              <div className="commentInfo" ref={comments}>
                <button className="commentRate">{currentHotel.rating}</button>
                傑出
                <br />
                {currentHotel.comments}則評論
              </div>
            </div>
            <div className="hotelImg">
              {currentHotel.photos.map((e, index) => (
                <div
                  key={index}
                  className="Imgwrap"
                  onClick={() => clickSlider(index)}
                >
                  <img src={e} key={index} />
                </div>
              ))}
            </div>
          </div>
          <div className="hotelDes">
            <div className="hotelDesText">
              {currentHotel.title}
              <br />
              {currentHotel.desc}
              <h2>熱門設施</h2>
              <p className="textIcon">
                {facilitiesList.map(
                  (facility) =>
                    currentHotel.facilities[facility.key] && (
                      <React.Fragment key={facility.key}>
                        <FontAwesomeIcon
                          icon={facility.icon}
                          className="textIconItem"
                        />
                        {facility.label}
                      </React.Fragment>
                    )
                )}
              </p>
              <div className="hotelExtraSection">
                <div className="hotelLeft">
                  <h2>空房情況</h2>
                  <div className="hotelLeft-searchBarItem">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      onClick={() => setOpenCalendar(!openCalendar)}
                    />
                    <span
                      className="searchText"
                      onClick={() => setOpenCalendar(!openCalendar)}
                    >
                      {format(dates[0].startDate, "MM/dd/yyyy")} -{" "}
                      {format(dates[0].endDate, "MM/dd/yyyy")}
                    </span>
                    {openCalendar && (
                      <DateRange
                        editableDateInputs={true}
                        onChange={handleDateChange}
                        moveRangeOnFirstSelection={false}
                        className="calendar"
                        ranges={dates}
                        minDate={new Date()}
                      />
                    )}
                  </div>
                  <div className="hotelLeft-listItem">
                    <button className="searchbtn" onClick={handleSearchHotels}>
                      搜尋
                    </button>
                  </div>
                </div>
                <div className="hotelRight">
                  <h2>飯店位置</h2>
                  <LeafletMapPicker
                    value={{
                      lat: currentHotel?.coordinates?.latitude || 10.2899,
                      lng: currentHotel?.coordinates?.longitude || 103.984,
                    }}
                    onChange={({ lat, lng }) => {
                      console.log("使用者選擇的座標:", lat, lng)
                    }}
                  />
                </div>
              </div>
            </div>
            <div></div>
            <div className="hotelDesBlock">
              <h2>住宿特色</h2>
              <p className="hotelDesBlockText">
                {format(dates[0].startDate, "MM/dd/yyyy")} -{" "}
                {format(dates[0].endDate, "MM/dd/yyyy")}
              </p>
              <p>
                入住 {night} 晚的最佳選擇！ 此住宿位於{currentHotel.city}
                的地區，地理位置評分高達 {currentHotel.rating} 分
                深受獨行旅客歡迎
              </p>
            </div>
          </div>
          <hr />
          {availableRooms && (
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
                    {availableRooms.map((e) => (
                      <tr key={e._id} className={e._id}>
                        <td>
                          <span className="roomTitle">
                            {e.title}
                            {e.roomType}
                          </span>
                          <IoBed />
                          <br />
                          {e.desc.map((item, index) => (
                            <span className="desc" key={index}>
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="iconCheck"
                              />
                              {item}
                            </span>
                          ))}
                        </td>
                        <td>
                          {Array.from({ length: e.maxPeople }).map(
                            (_, index) => (
                              <FontAwesomeIcon key={index} icon={faUserLarge} />
                            )
                          )}
                        </td>

                        <td className="twd">
                          $TWD {e.roomTotalPrice}
                          <br /> <span>包含稅費與其他費用</span>
                        </td>
                        <td>
                          <ul>
                            {e.paymentOptions.map((policy, index) => (
                              <li key={index}>
                                <strong>{policy.type}</strong>:
                                <span>{policy.description}</span>
                                <strong>
                                  (
                                  {policy.refundable === true
                                    ? "可退款"
                                    : "不可退款"}
                                  )
                                </strong>
                              </li>
                            ))}
                            <div className="service">
                              {e.service.breakfast && (
                                <div>
                                  <MdFreeBreakfast className="service-item" />{" "}
                                  含早餐
                                </div>
                              )}

                              {e.service.dinner && (
                                <div>
                                  <MdRestaurantMenu className="service-item" />{" "}
                                  含晚餐
                                </div>
                              )}

                              {e.service.parking && (
                                <div>
                                  <MdLocalParking className="service-item" />{" "}
                                  停車位
                                </div>
                              )}
                            </div>
                          </ul>
                        </td>
                        <td>
                          <button onClick={() => handleNavigateToOrder(e._id)}>
                            現在就預定
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Hotel
