/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-17 20:28:18
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-17 23:37:33
 * @FilePath: \my-app\src\components\Announcement.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import "./announcement.scss"
const Announcement = ({ type }) => {

    const [activeItem, setActiveItem] = useState('登入')
    const handleClickActive = (item) => {
        setActiveItem(item)
    }
    return (
        <div className='announcement'>
            <div className="container">
                {type === "Upper half"
                    ?
                    // true
                    <>
                        <div className="infoDes">
                            <FontAwesomeIcon icon={faInfoCircle} />
                            所需建議，在出發之前，查看最新外交部發布之旅遊警示，提供國人出國旅行之參考資訊
                        </div>
                        <div className="discountInfo">
                            <div className="left">
                                <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/160108451.jpg?k=276db1cee9672c663e0c40ab4ca7460dd21569524bf5542918acab6b6fe3ac1e&o=&hp=1" alt="" />
                            </div>
                            <div className="right">
                                <h2>暑假優惠</h2>
                                <span>2024 年 9 月 30 日前預訂並住房就優惠最高20%</span>
                                <button>逛逛優惠</button>
                            </div>
                        </div>
                    </>
                    :
                    // false
                    <div className="GlobalBanner">
                        <img src="https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png" alt="" />
                        <div className="BannerInfoDes">
                            <h2>Visa各項優惠</h2>
                            <span>刷Visa卡訂房最高享13%優惠</span>
                            <div className='Bannerbtn'>
                                <button className={`${activeItem === '登入' ? 'buttonActive' : ''}`} onClick={() => { handleClickActive('登入') }}>登入</button>
                                <button className={`${activeItem === '註冊' ? 'buttonActive' : ''}`} onClick={() => { handleClickActive('註冊') }}>註冊</button>
                            </div>
                        </div>
                    </div>

                }
            </div>
        </div>
    )
}

export default Announcement