/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-17 20:28:18
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-19 00:39:39
 * @FilePath: \my-app\src\components\Feature.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react'
import Categories from '../subcomponents/Categories'
import PopularHotels from '../subcomponents/PopularHotels'

import { useSelector } from 'react-redux'
import "./feature.scss"
const Feature = () => {
    const hotels = useSelector((state) => state.user.Hotels)
    return (
        <div className='feature'>
            <div className="container">
                <div className="listTitle">
                    <h2>依住宿類型瀏覽</h2>
                </div>
                <div className="listItems">
                    <Categories dataArray={hotels} />
                </div>
                
                <div className="listTitle">
                    <h2>五星級酒店</h2>
                </div>
                <div className="listItems">
                    <PopularHotels dataArray={hotels} />
                </div>
            </div>
        </div>
    )
}

export default Feature