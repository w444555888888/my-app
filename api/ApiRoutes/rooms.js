/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-14 15:39:00
 * @FilePath: \my-app\api\ApiRoutes\rooms.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import express from "express"
import { createRoom, deleteRoom, getAllRooms, getHotelRooms, updatedRoom } from "../RoutesController/room.js"

const router = express.Router()


//創建房間 
router.post("/", createRoom)

//更新房間
router.put("/:id", updatedRoom)

//刪除房間
router.delete("/:id", deleteRoom)

// 獲取所有房間
router.get("/", getAllRooms)

// 獲取特定酒店的所有房間
router.get("/findHotel/:hotelId", getHotelRooms)

export default router