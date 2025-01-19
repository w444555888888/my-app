import React, { useState, useEffect } from 'react'
import SearchItem from '../components/SearchItem'
import Navbar from '../components/Navbar'
import "./hotelsList.scss"
import { DateRange } from 'react-date-range'
import { format } from 'date-fns'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const HotelsList = () => {
    // 路由導航
    const navigate = useNavigate()

    // 預設日期為今天和一周後
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)

    // 路由傳遞數據
    const location = useLocation()
    const { destination: locationDestination, dates: locationDates, conditions: locationConditions, startDate: locationStartDate, endDate: locationEndDate } = location.state || {}

    const [openConditions, setOpenConditions] = useState(false)
    const [openCalendar, setOpenCalendar] = useState(false)

    // 搜尋欄
    const [destinationState, setDestinationState] = useState(locationDestination || '')

    // 飯店列表數據
    const [hotels, setHotels] = useState([])
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [startDate, setStartDate] = useState(locationStartDate || format(today, "yyyy-MM-dd"))
    const [endDate, setEndDate] = useState(locationEndDate || format(nextWeek, "yyyy-MM-dd"))

    // 日期
    const [dates, setDates] = useState(locationDates || [
        {
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : new Date(),
            key: 'selection',
        }
    ])


    // 人數/房間數
    const [conditions, setConditions] = useState(locationConditions || {
        adult: 1,
        room: 1,
    })

    const handleDateChange = (item) => {
        setDates([item.selection])
        setStartDate(format(item.selection.startDate, "yyyy-MM-dd"))
        setEndDate(format(item.selection.endDate, "yyyy-MM-dd"))
    }





    // 搜尋飯店條件
    const handleSearchHotelsPrice = () => {
        navigate(`/hotelsList?name=${destinationState}&minPrice=${minPrice}&maxPrice=${maxPrice}&startDate=${startDate}&endDate=${endDate}`)
    }

    // 副作用監聽的路由網址，發送請求
    useEffect(() => {
        const axiosHotels = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const queryString = Array.from(params.entries())
                    .map(([key, value]) => `${key}=${value}`)
                    .join('&');
                    
                const response = await axios.get(`http://localhost:5000/api/v1/hotels?${queryString}`);
                setHotels(response.data);
            } catch (error) {
                console.error('Error fetching hotels:', error);
            }
        };
    
        axiosHotels();
    }, [location.search]);
    


    return (
        <>
            <div>
                <Navbar />
                <div className="listContainer">
                    <div className="listWrapper">
                        <div className="listSearch">
                            <div className='searchTitle'>
                                搜尋目前最新資料
                            </div>
                            <div className="listItem">
                                <label>目的地／住宿名稱：</label>
                                <input type="text" className="searchInput" placeholder='要去哪裡?' value={destinationState}
                                    onChange={e => setDestinationState(e.target.value)} />
                            </div>
                            <div className="listItem">
                                <label>入住/退房日期</label>
                                <span className='dates'>
                                    <div className="searchInput" onClick={() => setOpenCalendar(!openCalendar)} >
                                        {format(dates[0].startDate, "MM/dd/yyyy")} - {format(dates[0].endDate, "MM/dd/yyyy")}
                                    </div>
                                    {openCalendar && <DateRange
                                        editableDateInputs={true}
                                        onChange={handleDateChange}
                                        moveRangeOnFirstSelection={false}
                                        ranges={dates}
                                        className="date"
                                        minDate={new Date()}
                                    />}
                                </span>
                            </div>

                            <div className="listItem">
                                <div className="listItemLimitPrice">
                                    <span className="limitTitle">
                                        每晚最低價格
                                    </span>
                                    <input type="text" className='searchInput'
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        required />



                                </div>
                                <div className="listItemLimitPrice">
                                    <span className="limitTitle">
                                        每晚最高價格
                                    </span>
                                    <input type="text" className='searchInput'
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        required />

                                </div>
                                <span className="limitTitle">
                                    人數/房間數
                                </span>
                                <div className="listItmConditions">
                                    <span className="SearchText" onClick={() => setOpenConditions(!openConditions)}  >
                                        {conditions.adult}位成人 · {conditions.room} 間房
                                    </span>
                                </div>
                            </div>
                            <div className="listItem">
                                <button className='searchbtn' onClick={handleSearchHotelsPrice}>搜尋</button>
                            </div>
                        </div>

                        <div className="listResult">
                            <div className="resultTitle">
                                <h2>在{destinationState ? destinationState : '全區域搜尋'}找到{hotels.length}間房間</h2>
                            </div>

                            {/* 飯店列表數據 */}
                            {hotels.map(hotel => (
                                hotel.availableRooms.length > 0
                                    ? <SearchItem key={hotel._id} hotel={hotel}/>
                                    : null
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HotelsList
