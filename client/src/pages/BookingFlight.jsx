import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './bookingFlight.scss'
import { format, parse, addMinutes } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlane } from '@fortawesome/free-solid-svg-icons'
import { request } from '../utils/apiService';
import { toast } from 'react-toastify'
import Skeleton from 'react-loading-skeleton';

const BookingFlight = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [flightData, setFlightData] = useState(null);
    const [passengers, setPassengers] = useState([{ name: '', idNumber: '', phone: '' }]);

    const calculateArrivalTime = (departureTime, duration) => {
        const departureDate = parse(departureTime, 'HH:mm', new Date())
        const arrivalDate = addMinutes(departureDate, duration)
        return format(arrivalDate, 'HH:mm');
    }

    const cabinTypeMap = {
        'FIRST': '頭等艙',
        'BUSINESS': '商務艙',
        'ECONOMY': '經濟艙'
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
            toast.error('請選擇艙等和航班日期');
            return;
        }

        if (passengers.some(p => !p.name || !p.idNumber)) {
            toast.error('請填寫完整的乘客信息');
            return;
        }

        try {
            setLoading(true);
            const result = await request('POST', '/flight/order', {
                flightId: id,
                category: selectedClass,
                departureDate: format(new Date(selectedDate), 'yyyy-MM-dd'),
                passengerInfo: passengers
            });

            if (result.success) {
                toast.success('訂票成功！');
                // 可以導航到訂單詳情頁
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('訂票失敗，請稍後重試');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const handleBookingFlight = async () => {
            const result = await request('GET', `/flight/${id}`, {}, setLoading);
            if (result.success) {
                setFlightData(result.data);
            } else {
                toast.error(result.message);
            }
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
                            <h2><Skeleton width={150} /></h2>
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
                            <h3><Skeleton width={120} /></h3>
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
                    </div>

                    <div className="routeInfo">
                        <div className="departure">
                            <div className="city">{flightData.route.departureCity}</div>
                            <div className="time">{flightData.route.standardDepartureTime}</div>
                        </div>
                        <div className="arrow">
                            <FontAwesomeIcon icon={faPlane} />
                        </div>
                        <div className="arrival">
                            <div className="city">{flightData.route.arrivalCity}</div>
                            <div className="time">
                                {calculateArrivalTime(
                                    flightData.route.standardDepartureTime,
                                    flightData.route.flightDuration
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="cabinSelection">
                        <h3>選擇艙等</h3>
                        <div className="cabinOptions">
                            {flightData.cabinClasses.map((cabin) => (
                                <div
                                    key={cabin._id}
                                    className={`cabinOption ${selectedClass === cabin.category ? 'selected' : ''}`}
                                    onClick={() => setSelectedClass(cabin.category)}
                                >
                                    <div className="cabinType">{cabinTypeMap[cabin.category]}</div>
                                    <div className="price">${cabin.basePrice}</div>
                                    <div className="seats">
                                        剩餘座位: {cabin.totalSeats - cabin.bookedSeats}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="scheduleSelection">
                        <h3>可用航班時間</h3>
                        <div className="scheduleOptions">
                            {flightData.schedules.map((schedule) => (
                                <div
                                    key={schedule._id}
                                    className={`scheduleOption ${selectedDate === schedule.departureDate ? 'selected' : ''}`}
                                    onClick={() => setSelectedDate(schedule.departureDate)}
                                >
                                    <div className="date">
                                        {format(new Date(schedule.departureDate), 'yyyy-MM-dd')}
                                    </div>
                                    <div className="time">
                                        {format(new Date(schedule.departureDate), 'HH:mm')} -
                                        {format(new Date(schedule.arrivalDate), 'HH:mm')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="passengerInfo">
                        <h3>乘客信息</h3>
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