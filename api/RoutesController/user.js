/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-06 16:07:52
 * @FilePath: \my-app\api\RoutesController\user.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { errorMessage } from "../errorMessage.js"
import User from "../models/User.js"

//更新使用者:id
export const updateUser = async (req, res, next) => {
  const id = req.params.id
  const { password, address, phoneNumber } = req.body 

  // 檢查必填字段
  if (!password || !address || !phoneNumber) {
    return next(errorMessage(400, "所有欄位都是必填的"))
  }

  try {
    const originalUser = await User.findById(id) // 找到原本要更新的使用者資料

    // 檢查用戶名和郵件的唯一性
    const updateUserNameWrong = await User.findOne({ username: req.body.username })
    const updateEmailWrong = await User.findOne({ email: req.body.email })

    if (updateUserNameWrong && updateUserNameWrong.id !== originalUser.id) {
      return next(errorMessage(400, "錯誤，此名稱已使用"))
    }

    if (updateEmailWrong && updateEmailWrong.id !== originalUser.id) {
      return next(errorMessage(400, "錯誤，此信箱已使用"))
    }

    // 更新用戶資料
    const updatedUser = await User.findByIdAndUpdate(id, {
      $set: { password, address, phoneNumber } // 確保更新這三個字段
    }, { new: true })

    res.status(200).json(updatedUser)
  } catch (error) {
    next(errorMessage(500, "更改用戶失敗", error))
  }
}

//刪除使用者
export const deletedUser = async (req, res, next) => {
  const id = req.params.id
  try {
    await User.findByIdAndDelete(id)
    res.status(200).json("用戶成功刪除")
  } catch (error) {
    next(errorMessage(500, "刪除用戶失敗", error))
  }
}
//讀取使用者資料
export const getUser = async (req, res, next) => {
  const id = req.params.id
  try {
    const getUser = await User.findById(id)
    res.status(200).json(getUser)
  } catch (error) {
    next(errorMessage(500, "讀取用戶失敗", error))
  }
}
//讀取全部使用者資料
export const getAllUsers = async (req, res, next) => {
  try {
    const getUsers = await User.find()
    res.status(200).json(getUsers)
  } catch (error) {
    next(errorMessage(500, "讀取全部用戶失敗", error))
  }
}