/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-17 20:28:18
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-01-18 16:27:40
 * @FilePath: \my-app\src\components\SearchItem.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react'
import "./searchItem.scss"
import { useNavigate } from 'react-router-dom'

const SearchItem = ({ hotel }) => {
  const navigate = useNavigate()
  const handleHotelDetail = () => {
    navigate(`/hotel/${hotel._id}`, {
      state: { hotel },
    })
  }

  //SearchItem的active狀態
  const [addactive, setAddActive] = useState(false)

  const handleClickActive = () => {
    setAddActive(!addactive)
  }


  return (
    <div className={`SearchItem ${addactive ? 'active' : ''}`} onClick={handleClickActive}>
      <img className="itemImg" src={hotel.photos[0]} alt="" />
      <div className="itemInfo">
        <div className="infoTitle">
          <h2>
            {hotel.title}
          </h2>
          <div className='infoTitleRight'>
            傑出<br />
            {hotel.comments}則評論
            <button className='infoTitleRate'>
              {hotel.rating}
            </button>
          </div>
        </div>
        <div className="infoDes">
          <span className="far">{hotel.distance}</span>
          {hotel.popularHotel && (
            <>
              <span className="prompt">接駁車接送</span><span className="prompt">附早餐</span>
            </>)}
          <div className="infoDetail">
            <div className="detailLeft">
              <div className="equipment">
                <b>標準雙人床－附獨立衛浴</b>
                <p>一張雙人床</p>
              </div>
              <div className="detailDes">
                <p>立即搶下優惠價－可取消</p>
                <b>此價格選項在本站僅剩 1 間</b>
              </div>
            </div>
            <div className="detailRight">
              <span className="optionDes">
                1晚、2位
              </span>
              <span className="price">
                TWD {hotel.cheapestPrice}
              </span>
              <span className="tax">
                含稅費與其他費用
              </span>
              <button className='btn' onClick={handleHotelDetail}>查看客房供應情況</button>
            </div>
          </div>
        </div>
      </div>

    </div>

  )
}

export default SearchItem
