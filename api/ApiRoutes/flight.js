/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-10-10 10:25:16
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-10-10 13:15:45
 * @FilePath: \my-app\api\ApiRoutes\auth.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import express from "express"
import { createFlight, updateFlight, getAllFlights, getFlight, deleteFlight, getAllFlightOrders, createFlightOrder, getUserOrders, getOrderDetail, cancelOrder } from "../RoutesController/flight.js"
import { verifyToken } from "../RoutesController/auth.js"; 

const router = express.Router()

// 航班訂票路由
router.get("/allOrder", getAllFlightOrders)
router.post("/order", verifyToken, createFlightOrder)
router.get("/orders/user", verifyToken, getUserOrders)
router.get("/orders/:id", getOrderDetail)
router.post("/orders/:id/cancel", verifyToken, cancelOrder)


// 航班管理路由
router.post("/", createFlight)
router.put("/:id", updateFlight)
router.get("/", getAllFlights)
router.get("/:id", getFlight)
router.delete("/:id", deleteFlight)


export default router

