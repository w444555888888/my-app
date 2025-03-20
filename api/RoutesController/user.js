/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-06 18:39:19
 * @FilePath: \my-app\api\RoutesController\user.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { errorMessage } from "../errorMessage.js"
import User from "../models/User.js"

//更新使用者:id
export const updateUser = async (req, res, next) => {
  const id = req.params.id
  const { password, address, phoneNumber, realName } = req.body

  // 檢查必填字段
  if (!password || !address || !phoneNumber || !realName) {
    return next(errorMessage(400, "所有欄位都是必填的"))
  }

  try {
    // 更新用戶資料，只更新這4個參數，其餘照舊
    const updatedUser = await User.findByIdAndUpdate(id, {
      $set: { password, address, phoneNumber, realName } 
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