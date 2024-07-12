import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import "./announcement.scss"
const Announcement = ({ type }) => {

    const [activeItem, setActiveItem] = useState('登入');
    const handleClickActive = (item) => {
        setActiveItem(item);
    };
    return (
        <div className='announcement'>
            <div className="container">
                {type === "Upper half"
                    ?
                    // true
                    <>
                        <div className="checktext">
                            <input type="checkbox" name="checkbox" id="checkbox" />
                            此為來回行程
                        </div>
                        <div className="infoDes">
                            <FontAwesomeIcon icon={faInfoCircle} />
                            所需建議，在出發之前，查看最新外交部發布之旅遊警示，提供國人出國旅行之參考資訊
                        </div>
                        <div className="discountInfo">
                            <div className="left">
                                <img src="https://r-xx.bstatic.com/data/mm/index_banner_getaway22_summer_2.jpg" alt="" />
                            </div>
                            <div className="right">
                                <h2>省 15% 或更多</h2>
                                <span>這個夏天，讓夢想之旅成真！2024 年 9 月 30 日前預訂並住房就優惠最高30%</span>
                                <button>逛逛優惠</button>
                            </div>
                        </div>
                    </>
                    :
                    // false
                    <div className="GlobalBanner">
                        <img src="https://cf.bstatic.com/static/img/genius-globe-with-badge_desktop@2x/1f5a273d871549f00bf6692f7ff612b5e8eda038.png" alt="" />
                        <div className="BannerInfoDes">
                            <h2>立即享受優惠</h2>
                            <span>登入您的 MIKE.BOOKING.com 帳戶，尋找紫色的圖標，輕鬆省一筆！</span>
                            <div className='Bannerbtn'>
                                <button className={`${activeItem === '登入' ? 'buttonActive' : ''}`} onClick={()=>{handleClickActive('登入')}}>登入</button>
                                <button className={`${activeItem === '註冊' ? 'buttonActive' : ''}`} onClick={()=>{handleClickActive('註冊')}}>註冊</button>
                            </div>
                        </div>
                    </div>

                }
            </div>
        </div>
    )
}

export default Announcement