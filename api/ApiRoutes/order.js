/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 *  @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-25 23:43:56
 * @FilePath: \my-app\api\ApiRoutes\hotels.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import express from "express"
import { getAllOrders, createOrder, getOrderById, updateOrder, deleteOrder } from "../RoutesController/order.js";

const router = express.Router();

// 全部訂單
router.get("/", getAllOrders);

// 新訂單
router.post("/", createOrder);

// 根據id查找
router.get("/find/:id", getOrderById);

// 根據id更新訂單
router.put("/:id", updateOrder);

// 根據id刪除訂單
router.delete("/:id", deleteOrder);

export default router;