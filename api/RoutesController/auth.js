/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-04-18 21:06:57
 * @FilePath: \my-app\api\RoutesController\auth.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import bcrypt from "bcryptjs" //密碼加密
import { errorMessage } from "../errorMessage.js"
import { sendResponse } from "../sendResponse.js"
import User from "../models/User.js"
import jwt from "jsonwebtoken" //身份驗證
import nodemailer from 'nodemailer'  //發送電子郵件
import crypto from 'crypto' //隨機令牌



export const register = async (req, res, next) => {
  const registerData = req.body
  try {
    const registerWrong = await User.findOne({ username: registerData.username }) || await User.findOne({ email: registerData.email })

    if (registerWrong) {
      return (next(errorMessage(400, "此帳號或信箱已被註冊")))
    }

    // 密碼bcrypt加密bcrypt加密  
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(registerData.password, salt)
    const newUser = new User({
      username: registerData.username,
      email: registerData.email,
      password: hash,
    }
    )
    const saveUser = await newUser.save()

    sendResponse(res, 200, saveUser)
  } catch (error) {
    return next(errorMessage(500, "註冊失敗", error))
  }
}

export const login = async (req, res, next) => {
  const loginData = req.body

  try {
    // 嘗試用 `username` 或 `email` 查找用戶
    const userData =
      await User.findOne({ username: loginData.account }) ||
      await User.findOne({ email: loginData.account }) // 這裡 `email` 應該也要對應 `account`，不然會找不到



    if (!userData) {
      return next(errorMessage(404, "沒有此使用者"))
    }

    // 驗證密碼
    const isPasswordCorrect = await bcrypt.compare(loginData.password, userData.password)

    if (!isPasswordCorrect) {
      return next(errorMessage(404, "輸入密碼錯誤"))
    }

    // 生成 JWT Token
    if (!process.env.JWT) {
      return next(errorMessage(500, "伺服器錯誤，JWT 未定義"))
    }

    const token = jwt.sign({ id: userData._id, isAdmin: userData.isAdmin }, process.env.JWT)
    // console.log("生成的 JWT:", token)

    // 排除密碼和 isAdmin，回傳其餘用戶資訊
    const { password, ...userDetails } = userData._doc
    // console.log("回傳的使用者資訊:", userDetails)

    res.cookie("JWT_token", token, {
      httpOnly: false,
      secure: false,
      path: "/",
    })
    sendResponse(res, 200, { userDetails })

  } catch (error) {
    return next(errorMessage(500, "登入失敗", error))
  }
}




// 忘記密碼
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body
  try {
    // 查找用戶
    const user = await User.findOne({ email })
    if (!user) {
      return next(errorMessage(404, "沒有此信箱的使用者"))
    }
    // 重置密碼令牌
    const token = crypto.randomBytes(32).toString("hex")

    // 在用戶資料中保存重置令牌和過期時間
    user.resetPasswordToken = token
    user.resetPasswordExpires = Date.now() + 3600000 // 1 小時後過期
    await user.save()

    // 發送郵件
    const transporter = nodemailer.createTransport({
      service: 'gmail', // gamil郵件服務
      auth: {
        /**
         * .env 用dotenv.config() //加載環境變數去撈發送郵件帳號
         * 預設發出去的郵件類型
         * 帳號 
         * 密碼: 二次驗證 > 用google應用專用密
         */
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // 郵件內容
    const mailOptions = {
      to: email,
      subject: '重置密碼請求',
      text: `請點擊以下鏈接重置你的密碼：\nhttp://localhost:3000/reset-password/${token}\n如果你沒有請求此操作，請忽略此郵件。`,
    }

    // 發送郵件
    try {
      await transporter.sendMail(mailOptions)
      return sendResponse(res, 200, null, { message: "重置密碼郵件已發送" })
    } catch (error) {
      return next(errorMessage(500, "郵件發送失敗", error))
    }
  } catch (error) {
    return next(errorMessage(500, "忘記密碼處理失敗", error))
  }
}






// 重置密碼
export const resetPassword = async (req, res, next) => {
  const { token } = req.params
  const { password } = req.body
  // resetPasswordToken確認token
  // resetPasswordExpires時間為1小時
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return next(errorMessage(404, "重置令牌無效或已過期"))
    }

    // 更新用戶密碼
    const salt = bcrypt.genSaltSync(10)
    user.password = bcrypt.hashSync(password, salt)
    user.resetPasswordToken = undefined // 清除令牌
    user.resetPasswordExpires = undefined // 清除過期時間
    await user.save()

    sendResponse(res, 200, null, { message: "密碼重置成功" })
  } catch (error) {
    // 記錄錯誤信息
    console.error("Error during password reset:", error)
    next(errorMessage(500, "重置密碼處理失敗", error))
  }
}


// 驗證用戶身份
export const verifyToken = async (req, res, next) => {
  try {
    // 從 cookie 中獲取 token
    const token = req.cookies.JWT_token

    if (!token) {
      next(errorMessage(401, "請先登入"))
    }

    // 解析 token
    const decoded = jwt.verify(token, process.env.JWT)

    // 將解碼後的用戶信息添加到請求req對象中 
    req.user = decoded

    // 下一步
    next()
  } catch (err) {
    next(errorMessage(403, "登入已過期，請重新登入"))
  }
}
