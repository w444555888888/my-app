import React, { useState } from 'react'
import SearchItem from '../components/SearchItem'
import Navbar from '../components/Navbar'
import "./hotelsList.scss"
import { DateRange } from 'react-date-range'
import { format } from 'date-fns'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
const HotelsList = () => {
    // 路由傳遞資料
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
        children: 0,
        room: 1,
    })

    // 飯店資料
    const hotels = useSelector((state) => state.user.Hotels)
console.log('====================================');
console.log(hotels,'hotels');
console.log('====================================');
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
                                <span className='dates' >
                                    <div className="searchInput" onClick={() => setOpenCalendar(!openCalendar)} >{format(dates[0].startDate, "MM/dd/yyyy")} - {format(dates[0].endDate, "MM/dd/yyyy")}</div>

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
                                    <input type="text" className='searchInput' />
                                </div>
                                <div className="listItemLimitPrice">
                                    <span className="limitTitle">
                                        每晚最高價格
                                    </span>
                                    <input type="text" className='searchInput' />
                                </div>
                                <span className="limitTitle">
                                    人數/房間數
                                </span>
                                <div className="listItmConditions">
                                    <span className="SearchText" onClick={() => setOpenConditions(!openConditions)}  >{conditions.adult}位成人 · {conditions.children} 位小孩 · {conditions.room} 間房</span>
                                </div>
                            </div>
                            <div className="listItem">
                                <button className='searchbtn'>搜尋</button>
                            </div>
                        </div>

                        <div className="listResult">
                            <div className="resultTitle">
                                <h2>在{destinationState ? destinationState : '全局'}找到400間房間</h2>
                            </div>
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