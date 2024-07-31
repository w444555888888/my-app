/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-17 20:28:18
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-31 21:56:38
 * @FilePath: \my-app\client\src\subcomponents\PopularHotels.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react'
import "./popularHotels.scss"
const PopularHotels = ({ dataArray }) => {
    return (
        <div className='popularHotels'>
            {dataArray.map((item, index) =>
                <div className="item" key={index}>
                    <img src={item.photos[0]} />
                    <div className="itemInfo">
                        <div className="title">
                            {item.title}
                        </div>
                        <div className="subTitle">
                            {item.title}
                        </div>
                        <div className="price">
                            TWD {item.cheapestPrice} 起
                        </div>
                        <div className="rate">
                            <button>{item.rating}</button>
                            <span>{item.rate >= 9.5 ? "超高分" : "很棒"}</span>
                            <p>{item.comments}則評論</p>
                        </div>
                    </div>
                </div>)}
        </div>
    )
}

export default PopularHotels