/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 *  @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-25 23:43:56
 * @FilePath: \my-app\api\ApiRoutes\hotels.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import express from "express"
import { getHotelNameSuggestions, getAllHotels, getPopularHotels, getSearchHotels, createHotel, deleteHotel, getHotel, updatedHotel } from "../RoutesController/hotels.js"

const router = express.Router()

//模糊搜尋飯店名稱
router.get('/suggestions', getHotelNameSuggestions)
//獲取所有飯店資訊
router.get('/', getAllHotels)
// 獲取熱門飯店資訊 給首頁、精選區塊用
router.get('/popular', getPopularHotels)
//獲取搜尋飯店資訊
router.get('/search', getSearchHotels)
//創建第一筆資料
router.post("/", createHotel)
//抓取第一筆資料練習
router.get("/find/:id", getHotel)
//將第一筆資料做修改練習
router.put("/:id", updatedHotel)
//刪除資料
router.delete("/:id", deleteHotel)

export default router