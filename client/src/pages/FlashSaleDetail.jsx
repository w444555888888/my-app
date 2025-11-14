import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel, faClock, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import DateRangePicker from "../components/DateRangePicker";
import dayjs from "dayjs";
import { request } from "../utils/apiService";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import "./flashSale.scss";

const FlashSaleDetail = () => {
    const { id } = useParams();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);
    const userId = id

    // 日期
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [date, setDate] = useState(null);


    const fetchData = async () => {
        setLoading(true);
        const res = await request("GET", `/hotelFlashSale/${id}`);
        if (res.success) {
            setSale(res.data);
        } else {
            toast.error("讀取活動資料失敗");
        }
        setLoading(false);
    };

    const handleBook = async () => {
        if (!date) {
            toast.warning("請先選擇入住日期");
            return;
        }
        setBooking(true);
        const res = await request("POST", "/hotelFlashSale/book", {
            saleId: sale._id,
            userId,
            date: dayjs(date).format("YYYY-MM-DD"),
        });

        if (res.success) {
            toast.success("搶購成功！");
        } else {
            toast.error(res.toast || "搶購失敗，請稍後再試");
        }
        setBooking(false);
    };




    useEffect(() => {
        fetchData();
    }, []);

    if (loading || !sale)
        return (
            <div className="fs-detail-loading">
                讀取中...
            </div>
        );

    const salePrice = Math.round(sale.basePrice * sale.discountRate);

    return (
        <div className="fs-detail-page">
            <div className="fs-detail-wrapper">
                <div className="fs-detail-banner-wrap">
                    <img
                        src={"http://localhost:5000" + sale.bannerUrl}
                        className="fs-detail-banner"
                    />
                </div>

                <div className="fs-detail-content">
                    <h2 className="title">{sale.title}</h2>
                    <p className="hotel">
                        <FontAwesomeIcon icon={faHotel} className="fs-icon hotel-icon" />
                        {sale.hotelId?.name}
                    </p>
                    <p className="room">房型：{sale.roomId?.title}</p>
                    <p className="time">
                        <FontAwesomeIcon icon={faClock} className="fs-icon time-icon" />
                        活動時間：
                        {dayjs(sale.startTime).format("YYYY-MM-DD")} ~{" "}
                        {dayjs(sale.endTime).format("YYYY-MM-DD")}
                    </p>

                    <p className="discount">
                        現在只要 <b>{sale.discountRate * 10} 折</b> ！
                    </p>
                    <p className="price">
                        原價：
                        <span className="fs-origin">
                            NT$ {sale.basePrice?.toLocaleString()}
                        </span>
                        <br />
                        搶購價：
                        <b className="fs-sale">NT$ {salePrice.toLocaleString()}</b>
                    </p>

                    <div className="fs-date-picker">
                        <button
                            className="fs-date-btn"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                            <FontAwesomeIcon icon={faCalendarAlt} />{" "}
                            {startDate ? `已選日期：${startDate}` : "選擇入住日期"}
                        </button>

                        {showDatePicker && (
                            <div className="fs-date-popup">
                                <DateRangePicker
                                    singleDay
                                    setStartDate={setStartDate}
                                    setEndDate={setEndDate}
                                    setDate={setDate}
                                    onClose={() => setShowDatePicker(false)}
                                />
                            </div>
                        )}
                    </div>

                    {sale.description && (
                        <div className="desc">
                            <div className="desc-title">活動說明</div>
                            <p>{sale.description}</p>
                        </div>
                    )}

                    <button
                        className="fs-btn"
                        onClick={handleBook}
                        disabled={booking}
                    >
                        {booking ? "搶購中..." : "立即搶購"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlashSaleDetail;
