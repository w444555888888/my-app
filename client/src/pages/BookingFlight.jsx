import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './bookingFlight.scss'
import { parse, addMinutes, format } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlane } from '@fortawesome/free-solid-svg-icons'
import { request } from '../utils/apiService';
import { toast } from 'react-toastify'
import Skeleton from 'react-loading-skeleton';

const BookingFlight = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [flightData, setFlightData] = useState(null);
    const [passengers, setPassengers] = useState([{ name: '', idNumber: '', phone: '' }]);

    const cabinTypeMap = {
        'FIRST': '頭等艙',
        'BUSINESS': '商務艙',
        'ECONOMY': '經濟艙'
    };

    const cityTimeZoneMap = {
        'Taipei': 'Asia/Taipei',
        'Tokyo': 'Asia/Tokyo',
        'Seoul': 'Asia/Seoul',
        'Beijing': 'Asia/Shanghai',
        'Singapore': 'Asia/Singapore',
        'Hong Kong': 'Asia/Hong_Kong',
        'Bangkok': 'Asia/Bangkok',
        'Sydney': 'Australia/Sydney',
        'Melbourne': 'Australia/Melbourne',
        'Dubai': 'Asia/Dubai',
        'London': 'Europe/London',
        'Paris': 'Europe/Paris',
        'New York': 'America/New_York',
        'Los Angeles': 'America/Los_Angeles',
        'Vancouver': 'America/Vancouver',
        'Toronto': 'America/Toronto',
        'Manila': 'Asia/Manila',
        'Kuala Lumpur': 'Asia/Kuala_Lumpur',
        'Ho Chi Minh': 'Asia/Ho_Chi_Minh'
    };

    const cityGMTMap = {
        'Taipei': '+8',
        'Tokyo': '+9',
        'Seoul': '+9',
        'Beijing': '+8',
        'Singapore': '+8',
        'Hong Kong': '+8',
        'Bangkok': '+7',
        'Sydney': '+10',
        'Melbourne': '+10',
        'Dubai': '+4',
        'London': '+0',
        'Paris': '+1',
        'New York': '-5',
        'Los Angeles': '-8',
        'Vancouver': '-8',
        'Toronto': '-5',
        'Manila': '+8',
        'Kuala Lumpur': '+8',
        'Ho Chi Minh': '+7'
    };


    const calculateArrivalTime = (departureTime, duration, departureCity, arrivalCity) => {
        const dateStr = selectedDate + 'T' + departureTime;
        // 將departureTime轉為出發城市的當地時間
        const departureLocal = parse(dateStr, 'yyyy-MM-dd\'T\'HH:mm', new Date())
        const departureZoned = toZonedTime(departureLocal, cityTimeZoneMap[departureCity]);
        // 加上飛行時間（仍在出發地時區）
        const arrivalUTC = addMinutes(departureZoned, duration);
        // 轉為抵達城市的當地時間
        const arrivalZoned = toZonedTime(arrivalUTC, cityTimeZoneMap[arrivalCity]);
        const isNextDay = arrivalZoned.getDate() !== departureZoned.getDate();
        return {
            time: format(arrivalZoned, 'HH:mm'),
            isNextDay
        };
    };


    const getCabinClasses = (availableSeats, prices) => {
        if (!availableSeats || !prices) return [];
        return Object.entries(availableSeats).map(([category, seats]) => ({
            category,
            availableSeats: seats,
            basePrice: prices[category]
        }));
    };

    const handleAddPassenger = () => {
        setPassengers([...passengers, { name: '', idNumber: '', phone: '' }]);
    };

    const handleRemovePassenger = (index) => {
        const newPassengers = passengers.filter((_, i) => i !== index);
        setPassengers(newPassengers);
    };

    const handlePassengerChange = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index][field] = value;
        setPassengers(newPassengers);
    };

    const handleSubmit = async () => {
        if (!selectedClass || !selectedDate) {
            toast.error('請選擇艙等 || 預設航班日期');
            return;
        }

        if (passengers.some(p => !p.name || !p.idNumber)) {
            toast.error('請填寫完整的乘客信息');
            return;
        }

        const result = await request('POST', '/flight/order', {
            flightId: id,
            category: selectedClass,
            departureDate: format(new Date(selectedDate), 'yyyy-MM-dd'),
            passengerInfo: passengers
        }, setLoading);

        if (result.success) {
            toast.success('訂票成功！');
        } else toast.error(result.message);
    };


    useEffect(() => {
        const handleBookingFlight = async () => {
            const result = await request('GET', `/flight/${id}?${searchParams.toString()}`, {}, setLoading);
            if (result.success) {
                setFlightData(result.data);
                if (result.data.schedules.length > 0) {
                    setSelectedDate(result.data.schedules[0].departureDate);
                }
            } else toast.error(result.message);
        };

        handleBookingFlight()
    }, [])






    if (!flightData) {
        return (
            <div className="bookingFlight">
                <Navbar />
                <div className="bookingContainer">
                    <h1><Skeleton width={200} /></h1>
                    <div className="flightDetails">
                        <div className="flightHeader">
                            <div><Skeleton width={150} /></div>
                        </div>
                        <div className="routeInfo">
                            <div className="departure">
                                <Skeleton width={100} height={30} />
                                <Skeleton width={80} />
                            </div>
                            <div className="arrow">
                                <Skeleton width={50} />
                            </div>
                            <div className="arrival">
                                <Skeleton width={100} height={30} />
                                <Skeleton width={80} />
                            </div>
                        </div>
                        <div className="cabinSelection">
                            <div><Skeleton width={120} /></div>
                            <div className="cabinOptions">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="cabinOption">
                                        <Skeleton width={150} height={100} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bookingFlight">
            <Navbar />
            <div className="bookingContainer">
                <h1>訂票詳情</h1>

                <div className="flightDetails">
                    <div className="flightHeader">
                        <h2>航班號：{flightData.flightNumber}</h2>
                        <div className="flightDate">
                            {selectedDate && (
                                <div>
                                    {format(new Date(selectedDate), 'yyyy年MM月dd日 EEEE')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="routeInfo">
                        <div className="departure">
                            <div className="city">{flightData.route.departureCity}</div>
                            <div className="time">
                                {flightData.route.standardDepartureTime}
                                <div className="timezone">

                                    <span>(GMT{cityGMTMap[flightData.route.departureCity]})</span>
                                </div>
                            </div>
                        </div>

                        <div className="arrow">
                            {Math.floor(flightData.route.flightDuration / 60)}小時
                            {flightData.route.flightDuration % 60}分 <FontAwesomeIcon icon={faPlane} />
                        </div>

                        <div className="arrival">
                            <div className="city">{flightData.route.arrivalCity}</div>
                            <div className="time">
                                {(() => {
                                    const arrival = calculateArrivalTime(
                                        flightData.route.standardDepartureTime,
                                        flightData.route.flightDuration,
                                        flightData.route.departureCity,
                                        flightData.route.arrivalCity
                                    );
                                    return (
                                        <>
                                            {arrival.time}
                                            {arrival.isNextDay && <span className="nextDay">+1</span>}
                                        </>
                                    );
                                })()}
                                <div className="timezone">

                                    <span>(GMT{cityGMTMap[flightData.route.arrivalCity]})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="cabinSelection">
                        <div>選擇艙等</div>
                        <div className="cabinOptions">
                            {flightData && flightData.schedules[0] &&
                                getCabinClasses(
                                    flightData.schedules[0].availableSeats,
                                    flightData.schedules[0].prices
                                ).map((cabin) => (
                                    <div
                                        key={cabin.category}
                                        className={`cabinOption ${selectedClass === cabin.category ? 'selected' : ''}`}
                                        onClick={() => setSelectedClass(cabin.category)}
                                    >
                                        <div className="cabinType">{cabinTypeMap[cabin.category]}</div>
                                        <div className="price">${cabin.basePrice}</div>
                                        <div className="seats">
                                            剩餘座位: {cabin.availableSeats}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>



                    <div className="passengerInfo">
                        <div>乘客信息</div>
                        {passengers.map((passenger, index) => (
                            <div key={index} className="passengerForm">
                                <input
                                    type="text"
                                    placeholder="乘客姓名"
                                    value={passenger.name}
                                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="身份證號"
                                    value={passenger.idNumber}
                                    onChange={(e) => handlePassengerChange(index, 'idNumber', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="手機號碼"
                                    value={passenger.phone}
                                    onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                                />
                                {passengers.length > 1 && (
                                    <button onClick={() => handleRemovePassenger(index)}>移除</button>
                                )}
                            </div>
                        ))}
                        <button onClick={handleAddPassenger}>添加乘客</button>
                    </div>

                    <button
                        className="bookButton"
                        disabled={!selectedClass || !selectedDate || loading}
                        onClick={handleSubmit}
                    >
                        {loading ? '訂票中...' : '確認訂票'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BookingFlight