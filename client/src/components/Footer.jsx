/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-17 20:28:18
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-18 00:08:45
 * @FilePath: \my-app\src\components\Footer.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react'
import "./footer.scss"
const Footer = () => {
    return (
        <div className='footer'>
            <div className="title">
                訂閱MIKE.BOOKING
                <span>
                    立即訂閱，我們將寄送最佳訂房優惠給您。
                </span>
            </div>
            <div className="emailcontainer">
                <div className="wrapper">
                    <input className='email' type="email" placeholder='您的電子郵件' />
                    <button className="sub">
                        訂閱 !
                    </button>
                </div>
                <div className="checktext">
                    <input type="checkbox" name="checkbox" id="checkbox" />
                    請發送 Booking.com 免費 App 下載連結給我！
                </div>
            </div>
            <div className="subcontainer">
                Copyright © 2024 Trip.com Travel Singapore Pte. Ltd. All rights reserved
                Site Operator: Trip.com Travel Singapore Pte. Ltd.
            </div>
        </div>
    )
}

export default Footer