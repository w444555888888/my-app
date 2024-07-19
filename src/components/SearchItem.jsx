/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-17 20:28:18
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-19 08:46:42
 * @FilePath: \my-app\src\components\SearchItem.jsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react'
import "./searchItem.scss"
import { useNavigate } from 'react-router-dom'

const SearchItem = ({ active }) => {
  const navigate = useNavigate()

  const handleClickToHotel = () => {
    navigate('/hotel')
  }


  return (
    <div className={`SearchItem ${active}`}>
      <img className="itemImg" src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/522878383.jpg?k=9ea00f9f7fad7c55854700d953ae6566250dc5039ea85fe3c85d52f1d0aad792&o=&hp=1" alt="" />
      <div className="itemInfo">
        <div className="infoTitle">
          <h2>
            所在行旅-渡咕所在UrbanAbode DUGU
          </h2>
          <div className='infoTitleRight'>
            傑出<br />
            1223則評論
            <button className='infoTitleRate'>
              9.8
            </button>
          </div>
        </div>
        <div className="infoDes">
          <span className="far"> 台北中正區台北市中正區忠孝西路一段50號24樓</span>
          <span className="discount">接駁車接送</span>

          <div className="infoDetail">
            <div className="detailLeft">
              <div className="equipment">
                <b>標準雙人床－附獨立衛浴</b>
                <p>一張雙人床</p>
              </div>
              <div className="detailDes">
                <b>免費取消</b>
                <p>立即搶下優惠價－可取消</p>
                <b>此價格選項在本站僅剩 1 間</b>
              </div>
            </div>
            <div className="detailRight">
              <span className="optionDes">
                1晚、2位
              </span>
              <span className="price">
                TWD 4890
              </span>
              <span className="tax">
                含稅費與其他費用
              </span>
              <button className='btn' onClick={handleClickToHotel}>查看客房供應情況</button>
            </div>
          </div>
        </div>
      </div>

    </div>

  )
}

export default SearchItem
