import React, { useState, useEffect } from 'react'
import './flight.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlane, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { DateRange } from 'react-date-range'
import Navbar from '../components/Navbar'
import { format, parse, addMinutes } from 'date-fns'
import zhTW from 'date-fns/locale/zh-TW'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { request } from '../utils/apiService';
import { toast } from 'react-toastify'
import EmptyState from '../subcomponents/EmptyState'

const Flight = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams();
    const [destination, setDestination] = useState("")
    const [departure, setDeparture] = useState("")
    const [openDate, setOpenDate] = useState(false)
    const [flights, setFlights] = useState([])
    const [dates, setDates] = useState([
        {
            startDate: null,
            endDate: null,
            key: 'selection'
        }
    ])


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


    const handleSearch = async () => {
        const params = {
            departure,
            destination,
        };

        if (dates[0].startDate && dates[0].endDate) {
            params.startDate = format(dates[0].startDate, 'yyyy-MM-dd');
            params.endDate = format(dates[0].endDate, 'yyyy-MM-dd');
        }

        setSearchParams(params);
        const result = await request('GET', `/flight?${params.toString()}`);
        if (result.success) {
            setFlights(result.data);
            toast.success('搜索完成');
        } else {
            toast.error(result.message);
        }
    };


    const handleBookingFlightRouter = async (flightId) => {
        navigate(`/bookingFlight/${flightId}`);
    };


    const calculateArrivalTime = (departureTime, duration) => {
        const departureDate = parse(departureTime, 'HH:mm', new Date());
        const arrivalDate = addMinutes(departureDate, duration);
        return format(arrivalDate, 'HH:mm');
    };


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
                            <FontAwesomeIcon icon={faCalendarDays}
                                className="icon"
                                onClick={() => setOpenDate(!openDate)} />
                            <span
                                onClick={() => setOpenDate(!openDate)}
                                className="searchText"
                            >{dates[0].startDate && dates[0].endDate
                                ? `${format(dates[0].startDate, "MM/dd/yyyy")} to ${format(dates[0].endDate, "MM/dd/yyyy")}`
                                : "請選擇日期"}</span>
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
                    {flights.length > 0 ?
                        flights.map((flight) => (
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
                                    <button className="bookButton" onClick={() => handleBookingFlightRouter(flight._id)}>訂票</button>
                                </div>
                            </div>
                        ))
                        : (
                            <EmptyState
                                title="目前沒有符合條件的航班"
                                description="很抱歉，我們無法找到相關的航班資訊"
                            />
                        )}
                </div>
            </div>
        </div>
    )
}

export default Flight