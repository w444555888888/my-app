import React, { useState, useEffect } from 'react'
import './flight.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlane, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import Navbar from '../components/Navbar'
import { format } from 'date-fns'
import zhTW from 'date-fns/locale/zh-TW'
import { request } from '../utils/apiService';
import { toast } from 'react-toastify'

const Flight = () => {
    const [destination, setDestination] = useState("")
    const [departure, setDeparture] = useState("")
    const [openDate, setOpenDate] = useState(false)
    const [flights, setFlights] = useState([])
    const [dates, setDates] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ])

    const handleSearch = () => {
        console.log("搜索條件：", { departure, destination, dates })
    }

    useEffect(() => {
        const handleAllFlight = async () => {
            const result = await request('GET', '/flight');
            if (result.success) {
                setFlights(result.data);
                toast.success('獲得航班數據');
            } else toast.error(`${result.message}`)
        };

        handleAllFlight()
    }, [])


    const calculateArrivalTime = (departureTime, duration) => {
        const [hours, minutes] = departureTime.split(':');
        const departureDate = new Date();
        departureDate.setHours(parseInt(hours));
        departureDate.setMinutes(parseInt(minutes));
        const arrivalDate = new Date(departureDate.getTime() + duration * 60000);
        return arrivalDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }


    return (
        <div className='flight'>
            <Navbar />
            <div className="flightContainer">
                <h1 className="title">航班查詢</h1>
                <div className="searchSection">
                    <div className="searchInputs">
                        <div className="searchItem">
                            <FontAwesomeIcon icon={faPlane} className="icon" />
                            <input
                                type="text"
                                placeholder="出發地"
                                value={departure}
                                onChange={(e) => setDeparture(e.target.value)}
                                className="searchInput"
                            />
                        </div>
                        <div className="searchItem">
                            <FontAwesomeIcon icon={faPlane} className="icon" />
                            <input
                                type="text"
                                placeholder="目的地"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="searchInput"
                            />
                        </div>
                        <div className="searchItem">
                            <FontAwesomeIcon icon={faCalendarDays} className="icon" />
                            <span
                                onClick={() => setOpenDate(!openDate)}
                                className="searchText"
                            >{`${format(dates[0].startDate, "MM/dd/yyyy")} to ${format(
                                dates[0].endDate,
                                "MM/dd/yyyy"
                            )}`}</span>
                            {openDate && (
                                <DateRange
                                    editableDateInputs={true}
                                    onChange={(item) => setDates([item.selection])}
                                    moveRangeOnFirstSelection={false}
                                    ranges={dates}
                                    className="date"
                                    minDate={new Date()}
                                    locale={zhTW}
                                />
                            )}
                        </div>
                        <button className="searchButton" onClick={handleSearch}>
                            搜尋航班
                        </button>
                    </div>
                </div>
                <div className="flightList">
                    {flights.map((flight) => (
                        <div className="flightItem" key={flight._id}>
                            <div className="flightInfo">
                                <div className="airline">航班號：{flight.flightNumber}</div>
                            </div>
                            <div className="routeInfo">
                                <div className="departure">
                                    <div className="city">{flight.route.departureCity}</div>
                                    <div className="time">{flight.route.standardDepartureTime}</div>
                                </div>
                                <div className="arrow">→</div>
                                <div className="arrival">
                                    <div className="city">{flight.route.arrivalCity}</div>
                                    <div className="time">
                                        {calculateArrivalTime(flight.route.standardDepartureTime, flight.route.flightDuration)}
                                    </div>
                                </div>
                            </div>
                            <div className="priceSection">
                                <div className="price">
                                    經濟艙: ${flight.cabinClasses.find(c => c.category === "ECONOMY")?.basePrice}<br />
                                    商務艙: ${flight.cabinClasses.find(c => c.category === "BUSINESS")?.basePrice}<br />
                                    頭等艙: ${flight.cabinClasses.find(c => c.category === "FIRST")?.basePrice}
                                </div>
                                <button className="bookButton">訂票</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Flight