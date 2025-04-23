import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Order from "../models/Order.js"
import { errorMessage } from "../errorMessage.js"
import { sendResponse } from "../sendResponse.js"
// 全部訂單
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();
    sendResponse(res, 200, orders);
  } catch (error) {
    return next(errorMessage(500, "查詢全部訂單: Error", error))
  }
};

// 新訂單
export const createOrder = async (req, res, next) => {

  // 檢查用戶身份
  if (!req.user || !req.user.id) {
    return next(errorMessage(401, "未登入或登入已過期"));
  }
  // 從cookie 中間件獲取用戶 ID
  const userId = req.user.id; 
  
  const { hotelId, roomId, totalPrice } = req.body;  // 解構傳入的訂單資料

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

    // 計算手續費 10%
    const serviceFee = totalPrice * 0.10;
    const totalPriceWithFee = totalPrice + serviceFee;

    // 如果酒店和房間都存在，創建新的訂單
    const newOrder = new Order({
      ...req.body,
      userId,
      totalPrice: totalPriceWithFee //加上手續費
    });
    const savedOrder = await newOrder.save();

    // 返回創建成功的訂單
    sendResponse(res, 201, savedOrder);
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

    sendResponse(res, 200, order);
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
    sendResponse(res, 200, updatedOrder);
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
    sendResponse(res, 200, null, { message: "訂單刪除成功" });
  } catch (error) {
    return next(errorMessage(500, "訂單id刪除訂單: Error", error))
  }
};