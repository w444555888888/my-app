import User from "../models/User.js";
import Order from "../models/Order.js";
import FlightOrder from "../models/FlightOrder.js";
import HotelFlashSaleOrder from "../models/HotelFlashSaleOrder.js";
import Subscribe from "../models/Subscribe.js";
import bcrypt from "bcryptjs";
import { errorMessage } from "../errorMessage.js";

// 更新使用者資訊
export const updateUserService = async (currentUser, userId, body) => {
  if (currentUser.id !== userId && !currentUser.isAdmin) {
    throw errorMessage(403, "您只能修改自己的資料");
  }

  const { password, isAdmin, address, phoneNumber, realName } = body;
  const updateObj = {};

  if (password && password.trim() !== "") {
    const salt = bcrypt.genSaltSync(10);
    updateObj.password = bcrypt.hashSync(password, salt);
  }

  if (currentUser.isAdmin && typeof isAdmin === "boolean") {
    updateObj.isAdmin = isAdmin;
  }

  if (address !== undefined) updateObj.address = address;
  if (phoneNumber !== undefined) updateObj.phoneNumber = phoneNumber;
  if (realName !== undefined) updateObj.realName = realName;

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateObj }, { new: true });
  if (!updatedUser) throw errorMessage(404, "找不到該用戶");

  return updatedUser;
};

// 刪除使用者與相關資料
export const deleteUserService = async (currentUser, userId) => {
  if (currentUser.id !== userId && !currentUser.isAdmin) {
    throw errorMessage(403, "您沒有權限刪除此用戶");
  }

  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) throw errorMessage(404, "找不到此使用者");

  await Promise.all([
    Order.deleteMany({ userId }),
    FlightOrder.deleteMany({ userId }),
    HotelFlashSaleOrder.deleteMany({ userId }),
    Subscribe.deleteMany({ userId })
  ]);
};

// 取得單一使用者與其訂單
export const getUserService = async (currentUser, userId) => {
  if (currentUser.id !== userId && !currentUser.isAdmin) {
    throw errorMessage(403, "您只能讀取自己的資料");
  }

  const user = await User.findById(userId);
  if (!user) throw errorMessage(404, "用戶未找到");

  const allOrder = await Order.find({ userId });

  const rawFlightOrders = await FlightOrder.find({ userId })
    .populate("flightId")
    .sort({ createdAt: -1 });

  const allFlightOrder = rawFlightOrders.map(order => {
    const flight = order.flightId;
    return { ...order.toObject(), route: flight?.route || null };
  });

  return { ...user.toObject(), allOrder, allFlightOrder };
};

// 取得全部使用者（限管理員）
export const getAllUsersService = async (currentUser) => {
  if (!currentUser.isAdmin) {
    throw errorMessage(403, "只有管理員可以查看所有用戶資料");
  }

  return User.find();
};
