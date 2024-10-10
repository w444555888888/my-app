/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-10-10 10:25:16
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-10-10 13:15:45
 * @FilePath: \my-app\api\ApiRoutes\auth.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import express from "express"
import { login, register, forgotPassword, resetPassword } from "../RoutesController/auth.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)

router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword) 

export default router

