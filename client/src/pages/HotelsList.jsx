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
    // 路由傳遞數據
    const location = useLocation()
    const { destination: locationdestination, dates: locationDates, conditions: locationConditions } = location.state || {}

    const [openConditions, setOpenConditions] = useState(false)
    const [openCalendar, setOpenCalendar] = useState(false)

    // 搜尋欄
    const [destinationState, setDestinationState] = useState(locationdestination || '')

    // 日期
    const [dates, setDates] = useState(locationDates || [
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        }
    ])

    // 人數/房間數
    const [conditions, setConditions] = useState(locationConditions || {
        adult: 1,
        room: 1,
    })

    // 飯店列表數據
    const [hotels, setHotels] = useState([])

    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')


    const navigate = useNavigate()
    // 飯店name搜尋完，根據name搜尋範圍價格
    const handleSearchHotelsPrice = () => {
        const params = new URLSearchParams(location.search)
        const paramsName = params.get('name')
        navigate(`/hotelsList?name=${paramsName}&minPrice=${minPrice}&maxPrice=${maxPrice}`, {

        })
    }

    // 副作用監聽的路由網址，發送請求
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const paramsName = params.get('name')
        const paramsMinPrice = params.get('minPrice')
        const paramsMaxPrice = params.get('maxPrice')

        const axiosHotels = async () => {
            try {

                 const queryString = `${paramsName ? `name=${paramsName}` : ''}${paramsMinPrice ? `&minPrice=${paramsMinPrice}` : ''}${paramsMaxPrice ? `&maxPrice=${paramsMaxPrice}` : ''}`

                const response = await axios.get(`http://localhost:5000/api/v1/hotels?${queryString}`)
                console.log(response.data,'responseresponseresponse');
                
                setHotels(response.data)
            } catch (error) {
                console.error('Error fetching hotels:', error)
            }
        }

        axiosHotels()
    }, [location.search])






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
                                        onChange={item => setDates([item.selection])}
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
                                    onChange={(e)=>setMinPrice(e.target.value)}
                                    required/>


                                 
                                </div>
                                <div className="listItemLimitPrice">
                                    <span className="limitTitle">
                                        每晚最高價格
                                    </span>
                                    <input type="text" className='searchInput' 
                                    value={maxPrice}
                                    onChange={(e)=>setMaxPrice(e.target.value)}
                                    required/>

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
                                <SearchItem key={hotel._id} hotel={hotel} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HotelsList
