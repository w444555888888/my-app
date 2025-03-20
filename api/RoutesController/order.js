import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Order from "../models/Order.js"
import User from "../models/User.js"
import { errorMessage } from "../errorMessage.js"

// 全部訂單
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    return next(errorMessage(500, "查詢全部訂單: Error", error))
  }
};

// 新訂單
export const createOrder = async (req, res, next) => {
  const { hotelId, roomId, userId, totalPrice } = req.body;  // 解構傳入的訂單資料

  try {
    // 檢查是否已存在相同的訂單
    const existingOrder = await Order.findOne({
      hotelId,
      roomId,
      userId,
      status: { $ne: 'completed' }  // 排除已完成的訂單
    });

    if (existingOrder) {
      return next(errorMessage(400, "此飯店房型尚有未處理訂單，請先處理完成現有訂單"))
    }

    // 檢查酒店是否存在
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return next(errorMessage(404, "新訂單 Hotel not found"))
    }

    // 檢查房間是否存在
    const room = await Room.findById(roomId);
    if (!room) {
      return next(errorMessage(404, "新訂單 Room not found"))
    }

    // 查找用戶資料
    const user = await User.findById(userId);
    if (!user) {
      return next(errorMessage(404, "用戶不存在"))
    }

    // 計算手續費 10%
    const serviceFee = totalPrice * 0.10;
    const totalPriceWithFee = totalPrice + serviceFee;

    // 如果酒店和房間都存在，創建新的訂單
    const newOrder = new Order({
      ...req.body,
      userInfo: user,
      totalPrice: totalPriceWithFee //加上手續費
    });
    const savedOrder = await newOrder.save();

    // 返回創建成功的訂單
    res.status(201).json(savedOrder);
  } catch (error) {
    return next(errorMessage(500, "新訂單: Error", error))
  }
};


//根據id查找
export const getOrderById = async (req, res, next) => {
  try {
    // Order model 設定 ref
    const order = await Order.findById(req.params.id)
      .populate('hotelId')
      .populate('roomId');

    if (!order) {
      return next(errorMessage(404, "訂單不存在"))
    }

    res.status(200).json(order);
  } catch (error) {
    return next(errorMessage(500, "訂單id查找: Error", error))
  }
};

// 根據id更新訂單
export const updateOrder = async (req, res, next) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedOrder) {
      return next(errorMessage(404, "訂單不存在"))
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    return next(errorMessage(500, "訂單id更新訂單: Error", error))
  }
};

// 根據id刪除訂單
export const deleteOrder = async (req, res, next) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return next(errorMessage(404, "訂單不存在"))
    }
    res.status(200).json({ message: "訂單刪除成功" });
  } catch (error) {
    return next(errorMessage(500, "訂單id刪除訂單: Error", error))
  }
};