import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel, faClock } from "@fortawesome/free-solid-svg-icons";

import { request } from "../utils/apiService";
import { useParams } from "react-router-dom";
import "./flashSale.scss";

const FlashSaleDetail = () => {
    const { id } = useParams();
    const [sale, setSale] = useState(null);

    const fetchData = async () => {
        const res = await request("GET", `/hotelFlashSale/${id}`);
        if (res.success) setSale(res.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (!sale) return <div className="fs-detail-loading">讀取中...</div>;

    return (
        <div className="fs-detail-page">
            <div className="fs-detail-wrapper">
                <div className="fs-detail-banner-wrap">
                    <img src={"http://localhost:5000" + sale.bannerUrl} className="fs-detail-banner" />
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
                        活動時間：{sale.startTime.substring(0, 10)} ~ {sale.endTime.substring(0, 10)}
                    </p>
                    <p className="discount">
                        現在只要 <b>{sale.discountRate * 10} 折</b> ！
                    </p>
                    <p className="price">
                        原價：<span className="fs-origin">NT$ {sale.basePrice?.toLocaleString()}</span><br />
                        搶購價：<b className="fs-sale">NT$ {(sale.basePrice * sale.discountRate).toLocaleString()}</b>
                    </p>
                    {sale.description && (
                        <div className="desc">
                            <h3>活動說明</h3>
                            <p>{sale.description}</p>
                        </div>
                    )}

                    <button className="fs-btn">立即搶購</button>
                </div>
            </div>
        </div>
    );
};

export default FlashSaleDetail;
