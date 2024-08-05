/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-05 14:46:25
 * @FilePath: \my-app\api\RoutesController\auth.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import bcrypt from "bcryptjs"
import { errorMessage } from "../errorMessage.js"
import User from "../models/User.js"

import jwt from "jsonwebtoken"

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

    const { password, isAdmin, ...userDetails } = userData._doc
    res
      .cookie('JWT_token', token, {
        httpOnly: true
      })
      .status(200).json({ userDetails })

  } catch (error) {
    next(errorMessage(500, "登入失敗", error))
  }
}


