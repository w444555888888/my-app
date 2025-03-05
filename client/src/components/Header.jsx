import { faBed, faCalendar, faPeopleGroup } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import 'react-date-range/dist/styles.css' // main css file
import 'react-date-range/dist/theme/default.css' // theme css file
import { DateRange } from 'react-date-range'
import format from 'date-fns/format'
import { useNavigate } from 'react-router-dom'
import "./header.scss"
const Header = () => {
    // 路由導航
    const navigate = useNavigate()
    // 預設日期為今天和一周後
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const [openConditions, setOpenConditions] = useState(false)
    const [openCalendar, setOpenCalendar] = useState(false)
    const [destination, setDestination] = useState('')
    const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(nextWeek, "yyyy-MM-dd"));

    const [dates, setDates] = useState([{
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        key: 'selection'
    }])

    const [conditions, setConditions] = useState(
        {
            adult: 1,  //初始人數,房間數為一
            room: 1,
        }
    )
    const handleCounter = (name, sign) => {
        setConditions(prev => {
            return {
                ...prev,
                [name]: sign === "increase" ? conditions[name] + 1 : conditions[name] - 1
            }
        })
    }



    const handleDateChange = (item) => {
        setDates([item.selection])
        setStartDate(format(item.selection.startDate, "yyyy-MM-dd"))
        setEndDate(format(item.selection.endDate, "yyyy-MM-dd"))
    }

    const handleSearchClick = async (e) => {
        const queryParams = new URLSearchParams();
        if (destination) queryParams.set('name', destination);
        if (startDate) queryParams.set('startDate', startDate);
        if (endDate) queryParams.set('endDate', endDate);
        navigate(`/hotelsList?${queryParams.toString()}`, {
            state: {
                destination,
                dates,
                conditions,
                startDate,
                endDate
            },
        });
    }
    



    return (
        <div className='header'>
            <div className="headerContainer">
                <h1 className="headerTitle">
                    尋找下趟住宿
                </h1>
                <p className="headerDes">搜尋飯店、民宿及其他住宿類型的優惠…
                    <br />MIKE.Booking.com</p>


                <div className="headerSearchBar">
                    <div className="SearchBarItem">
                        <FontAwesomeIcon icon={faBed} />
                        <input type="text" placeholder='你要去哪裡？' className='SearchInput' value={destination}
                            onChange={e => setDestination(e.target.value)} />
                    </div>
                    <div className="SearchBarItem">
                        <FontAwesomeIcon icon={faCalendar} onClick={() => setOpenCalendar(!openCalendar)} />
                        <span className="SearchText" onClick={() => setOpenCalendar(!openCalendar)} >
                            {format(dates[0].startDate, "MM/dd/yyyy")} - {format(dates[0].endDate, "MM/dd/yyyy")}
                        </span>
                        {openCalendar && <DateRange
                            editableDateInputs={true}
                            onChange={handleDateChange}
                            moveRangeOnFirstSelection={false}
                            className="calendar"
                            ranges={dates}
                            minDate={new Date()}
                        />}
                    </div>
                    <div className="SearchBarItem">
                        <FontAwesomeIcon icon={faPeopleGroup} onClick={() => setOpenConditions(!openConditions)} />
                        <span className="SearchText" onClick={() => setOpenConditions(!openConditions)}  >{conditions.adult}位成人 · {conditions.room} 間房</span>
                        {openConditions &&
                            <div className="ConditionsContainer">
                                <div className="condition">
                                    成人
                                    <div className="conditionCounter">
                                        <button className="conditionCounterButton" disabled={conditions.adult <= 1}
                                            onClick={() => handleCounter("adult", "decrease")} >
                                            -
                                        </button>
                                        <span className="number">{conditions.adult}</span>
                                        <button className="conditionCounterButton" onClick={() => handleCounter("adult", "increase")}>
                                            +
                                        </button>
                                    </div>
                                </div>


                                <div className="condition">
                                    房間
                                    <div className="conditionCounter">
                                        <button className="conditionCounterButton" disabled={conditions.room <= 1}
                                            onClick={() => handleCounter("room", "decrease")}>
                                            -
                                        </button>
                                        <span className="number"> {conditions.room}</span>
                                        <button className="conditionCounterButton" onClick={() => handleCounter("room", "increase")}>
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    <button className='SearchBarBtn' onClick={handleSearchClick}>搜尋</button>
                </div>
            </div>

        </div>
    )
}

export default Header