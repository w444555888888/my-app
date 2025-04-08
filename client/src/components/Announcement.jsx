/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-17 20:28:18
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-19 13:58:37
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
                            出發前請務必查看最新的外交部旅遊警示，掌握目的地的即時安全資訊，安心出遊！
                        </div>
                        <div className="discountInfo">
                            <div className="left">
                                <img src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/563834829.jpg?k=9abbe9b215903d92d58a8be200b95052f28ac8e30c12f7194f001179c8330d9c&amp;o=" alt="" />
                            </div>
                            <div className="right">
                                <span>春季精選住宿</span>
                                <span>立即預訂東京、大阪、首爾熱賣飯店，享最多 30% 折扣</span>
                                <button>查看熱門地點</button>
                            </div>
                        </div>
                    </>
                    :
                    // false
                    <div className="GlobalBanner">
                        <img src="https://cf.bstatic.com/static/img/contact/cs/cs-globe/981cf108eeecda859688c0e51d4ea87595d70912.png" alt="" />
                        <div className="BannerInfoDes">
                            <h2>加入會員，解鎖專屬優惠</h2>
                            <span>成為會員即可享有專屬折扣、累積點數、快速查詢訂單等貼心服務</span>
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