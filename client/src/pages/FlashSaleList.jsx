import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import { request } from "../utils/apiService";
import { useNavigate } from "react-router-dom";
import "./flashSale.scss";

const FlashSaleList = () => {
    const [list, setList] = useState([]);
    const navigate = useNavigate();

    const fetchData = async () => {
        const res = await request("GET", "/hotelFlashSale");
        if (res.success) setList(res.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="flash-sale-page">
            <h2 className="fs-title">
                <FontAwesomeIcon icon={faFire} className="fs-icon fire" />
                飯店搶購專區
            </h2>

            <div className="fs-list">
                {list.map((item) => (
                    <div
                        className="fs-card"
                        key={item._id}
                        onClick={() => navigate(`/flash-sale/${item._id}`)}
                    >
                        <div className="fs-img-wrap">
                            <img src={"http://localhost:5000" + item.bannerUrl} className="fs-img" />
                        </div>

                        <div className="fs-info">
                            <h3 className="fs-name">{item.title}</h3>

                            <p className="fs-hotel">{item.hotelId?.name}</p>
                            <p className="fs-room">房型：{item.roomId?.title}</p>

                            <p className="fs-date">
                                {item.startTime.substring(0, 10)} ~ {item.endTime.substring(0, 10)}
                            </p>
                            <p className="fs-price">
                                原價：<span className="fs-origin">NT$ {item.basePrice?.toLocaleString()}</span><br />
                                搶購價：<b className="fs-sale">NT$ {(item.basePrice * item.discountRate).toLocaleString()}</b>
                            </p>
                            <p className="fs-discount">
                                限時折扣：<b>{item.discountRate * 10}折</b>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlashSaleList;
