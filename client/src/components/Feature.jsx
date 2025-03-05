/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-17 20:28:18
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-09 18:05:18
 * @FilePath: \my-app\src\components\Feature.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from 'react'
import Categories from '../subcomponents/Categories'
import PopularHotels from '../subcomponents/PopularHotels'
import { request } from '../utils/apiService'
import "./feature.scss"
const Feature = () => {
    const [hotels, setHotels] = useState([])

    useEffect(() => {
        const allHotels = async () => {
            const result = await request('GET', '/hotels', {});
            if (result.success) {
                setHotels(result.data);
            }
        };

        allHotels();
    }, []);

    const populatHotels = hotels.filter((e) => { return e.popularHotel === true })

    return (
        <div className='feature'>
            <div className="container">
                <div className="listTitle">
                    <span>依住宿類型瀏覽</span>
                </div>
                <div className="listItems">
                    <Categories dataArray={hotels} />
                </div>

                <div className="listTitle">
                    <span>近期受歡迎飯店</span>
                </div>
                <div className="listItems">
                    <PopularHotels dataArray={populatHotels} />
                </div>
            </div>
        </div>
    )
}

export default Feature