/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-06 18:39:19
 * @FilePath: \my-app\api\RoutesController\user.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { errorMessage } from "../errorMessage.js";
import { sendResponse } from "../sendResponse.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import HotelFlashSaleOrder from "../models/HotelFlashSaleOrder.js";
import FlightOrder from "../models/FlightOrder.js";
import Subscribe from "../models/Subscribe.js";
import bcrypt from "bcryptjs"; //密碼加密

//更新使用者資訊
export const updateUser = async (req, res, next) => {
  const id = req.params.id;

  // 檢查是否為本人或管理員
  if (req.user.id !== id && !req.user.isAdmin) {
    return next(errorMessage(403, "您只能修改自己的資料"));
  }

  const { password, isAdmin, address, phoneNumber, realName } = req.body;

  const updateObj = {};

  // 密碼如果有傳進來(加密更新)
  if (password && password.trim() !== "") {
    const salt = bcrypt.genSaltSync(10);
    updateObj.password = bcrypt.hashSync(password, salt);
  }

  // isAdmin 只有管理員才能修改
  if (req.user.isAdmin && typeof isAdmin === "boolean") {
    updateObj.isAdmin = isAdmin;
  }

  if (address !== undefined) updateObj.address = address;
  if (phoneNumber !== undefined) updateObj.phoneNumber = phoneNumber;
  if (realName !== undefined) updateObj.realName = realName;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true }
    );

    sendResponse(res, 200, updatedUser);
  } catch (error) {
    return next(errorMessage(500, "更改用戶失敗", error));
  }
};

//刪除使用者(包含使用者.飯店訂單.機票訂單.飯店限時搶購.訂閱)
export const deletedUser = async (req, res, next) => {
  const id = req.params.id;

  // 檢查是否為本人或管理員
  if (req.user.id !== id && !req.user.isAdmin) {
    return next(errorMessage(403, "您沒有權限刪除此用戶"));
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return next(errorMessage(404, "找不到此使用者"));
    }
    const hotelOrders = await Order.deleteMany({ userId: id });
    const flightOrders = await FlightOrder.deleteMany({ userId: id });
    const flashSaleOrders = await HotelFlashSaleOrder.deleteMany({
      userId: id,
    });
    const subscribes = await Subscribe.deleteMany({ userId: id });
    sendResponse(res, 200, null, { message: "使用者與所有相關資料已成功刪除" });
  } catch (error) {
    return next(errorMessage(500, "刪除用戶失敗", error));
  }
};

//取得單一使用者與其訂單
export const getUser = async (req, res, next) => {
  const id = req.params.id;

  if (req.user.id !== id && !req.user.isAdmin) {
    return next(errorMessage(403, "您只能讀取自己的資料"));
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(errorMessage(404, "用戶未找到"));
    }

    const allOrder = await Order.find({ userId: id });

    // populate flightId 拿到航班資料
    const rawFightOrders = await FlightOrder.find({ userId: id })
      .populate("flightId")
      .sort({ createdAt: -1 });
    const allFlightOrder = rawFightOrders.map((order) => {
      const flight = order.flightId;
      return {
        ...order.toObject(),
        route: flight?.route || null,
      };
    });

    // 3. 回傳整合後資料
    sendResponse(res, 200, {
      ...user.toObject(),
      allOrder,
      allFlightOrder,
    });
  } catch (error) {
    return next(errorMessage(500, "讀取用戶失敗", error));
  }
};

//取得全部使用者（限管理員）
export const getAllUsers = async (req, res, next) => {
  // 只有管理員可以查看所有用戶
  if (!req.user.isAdmin) {
    return next(errorMessage(403, "只有管理員可以查看所有用戶資料"));
  }

  try {
    const getUsers = await User.find();
    sendResponse(res, 200, getUsers);
  } catch (error) {
    return next(errorMessage(500, "讀取全部用戶失敗", error));
  }
};
