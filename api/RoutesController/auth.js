/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-10-10 13:31:35
 * @FilePath: \my-app\api\RoutesController\auth.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import bcrypt from "bcryptjs"
import { errorMessage } from "../errorMessage.js"
import User from "../models/User.js"

import jwt from "jsonwebtoken"
import nodemailer from 'nodemailer'  //發送電子郵件
import crypto from 'crypto' //令牌


export const register = async (req, res, next) => {
  const registerData = req.body
  try {
    const registerWrong = await User.findOne({ username: registerData.username }) || await User.findOne({ email: registerData.email })

    if (registerWrong) return (next(errorMessage(400, "此帳號或信箱已被註冊")))

    // bcrypt加密  
    const salt = bcrypt.genSaltSync(10)
    //所以我們會單獨利用到password分離並加密
    const hash = bcrypt.hashSync(registerData.password, salt)
    //原本是與創建hotel的資料一樣
    const newUser = new User({ //這邊在合併
      username: registerData.username,
      email: registerData.email,
      password: hash,
    }
    )
    const saveUser = await newUser.save()
    //但這邊要分離處理來保護我們的使用者資料 
    res.status(200).json(saveUser)
  } catch (error) {
    next(errorMessage(500, "註冊失敗", error))
  }
}

//account 可以輸入 信箱與使用者姓名
export const login = async (req, res, next) => {
  const loginData = req.body
  try {
    const userData = await User.findOne({ username: loginData.account }) || await User.findOne({ email: loginData.account })
    if (!userData) return (next(errorMessage(404, "沒有此使用者")))

    const isPasswordCorrect = await bcrypt.compare(loginData.password, userData.password)
    if (!isPasswordCorrect) return (next(errorMessage(404, "輸入密碼錯誤")))

    //process.env.JWT
    const token = jwt.sign({ id: userData._id, isAdmin: userData.isAdmin }, process.env.JWT)

    //排除密碼 && isAdmin ，只返回其餘對象
    const { password, isAdmin, ...userDetails } = userData._doc
    res
      .cookie('JWT_token', token, {
        httpOnly: true,
        secure: false,
        path: '/',
      })
      .status(200).json({ userDetails })

  } catch (error) {
    next(errorMessage(500, "登入失敗", error))
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
         * .env 用dotenv.config() //加載環境變數去撈資料
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
      return res.status(200).json({ message: "重置密碼郵件已發送" })
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

    res.status(200).json({ message: "密碼重置成功" })
  } catch (error) {
    // 記錄錯誤信息
    console.error("Error during password reset:", error)
    next(errorMessage(500, "重置密碼處理失敗", error))
  }
}
