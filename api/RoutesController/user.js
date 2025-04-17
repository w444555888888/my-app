/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-06 18:39:19
 * @FilePath: \my-app\api\RoutesController\user.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { errorMessage } from "../errorMessage.js"
import { sendResponse } from "../sendResponse.js"
import User from "../models/User.js"
import Order from "../models/Order.js";
import FightOrder from "../models/FightOrder.js";
import bcrypt from "bcryptjs" //密碼加密


//更新使用者:id
export const updateUser = async (req, res, next) => {
  // 檢查是否為本人操作
  if (req.user.id !== req.params.id) {
    return next(errorMessage(403, "您只能修改自己的資料"));
  }

  const id = req.params.id
  const { password, address, phoneNumber, realName } = req.body

  // 檢查必填字段
  if (!password || !address || !phoneNumber || !realName) {
    return next(errorMessage(400, "所有欄位都是必填的"))
  }

  // 密碼bcrypt加密
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  try {
    // 更新用戶資料，只更新這4個參數，其餘照舊
    const updatedUser = await User.findByIdAndUpdate(id, {
      $set: { password: hashedPassword, address, phoneNumber, realName }
    }, { new: true })

    sendResponse(res, 200, updatedUser);
  } catch (error) {
    next(errorMessage(500, "更改用戶失敗", error))
  }
}


//刪除使用者
export const deletedUser = async (req, res, next) => {
  // 檢查是否為本人操作
  if (req.user.id !== req.params.id) {
    return next(errorMessage(403, "您只能修改自己的資料"));
  }

  const id = req.params.id
  try {
    await User.findByIdAndDelete(id)
    sendResponse(res, 200, null, { message: "用戶成功刪除" });
  } catch (error) {
    next(errorMessage(500, "刪除用戶失敗", error))
  }
}


//讀取使用者資料
export const getUser = async (req, res, next) => {
  // 檢查是否為本人操作
  if (req.user.id !== req.params.id) {
    return next(errorMessage(403, "您只能讀取自己的資料"));
  }
  const id = req.params.id
  try {
    const user = await User.findById(id);
    if (!user) {
      return sendResponse(res, 404, null, { message: "用戶未找到" });
    }
    const allOrder = await Order.find({ userId: id });
    const allFightOrder = await FightOrder.find({ userId: id });
    sendResponse(res, 200, { ...user.toObject(), allOrder, allFightOrder });
  } catch (error) {
    next(errorMessage(500, "讀取用戶失敗", error))
  }
}


//讀取全部使用者資料
export const getAllUsers = async (req, res, next) => {
  // 只有管理員可以查看所有用戶
  if (!req.user.isAdmin) {
    return next(errorMessage(403, "只有管理員可以查看所有用戶資料"));
  }

  try {
    const getUsers = await User.find()
    sendResponse(res, 200, getUsers);
  } catch (error) {
    next(errorMessage(500, "讀取全部用戶失敗", error))
  }
}