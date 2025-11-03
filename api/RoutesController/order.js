import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Order from "../models/Order.js"
import RoomInventory from "../models/RoomInventory.js";
import { errorMessage } from "../errorMessage.js"
import { sendResponse } from "../sendResponse.js"
import { notifyNewOrder } from "../websocket/orderHandler.js";
import { subDays, format, parseISO } from "date-fns";


// 取得全部訂單
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();
    sendResponse(res, 200, orders);
  } catch (error) {
    return next(errorMessage(500, "查詢全部訂單: Error", error))
  }
};


// 新訂單（含庫存檢查）
export const createOrder = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(errorMessage(401, "未登入或登入已過期"));
  }

  const userId = req.user.id;
  const { hotelId, roomId, totalPrice, checkInDate, checkOutDate } = req.body;

  try {
    // 驗證資料
    const [hotel, room] = await Promise.all([
      Hotel.findById(hotelId),
      Room.findById(roomId),
    ]);
    if (!hotel) return next(errorMessage(404, "Hotel not found"));
    if (!room) return next(errorMessage(404, "Room not found"));

    // 計算日期區間（退房日不算）
    const start = parseISO(checkInDate);
    const end = parseISO(checkOutDate);
    const dates = [];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(format(d, "yyyy-MM-dd"));
    }

    // 檢查庫存
    const inventories = await RoomInventory.find({
      roomId,
      date: { $in: dates },
    });
    const insufficient = inventories.find(
      (inv) => inv.bookedRooms >= inv.totalRooms
    );
    if (insufficient) {
      return next(errorMessage(400, `日期 ${insufficient.date} 庫存不足`));
    }

    // 扣除庫存
    await Promise.all(
      dates.map((date) =>
        RoomInventory.findOneAndUpdate(
          { roomId, date },
          { $inc: { bookedRooms: 1 } },
          { upsert: true }
        )
      )
    );

    // 手續費 + 總價
    const serviceFee = totalPrice * 0.1;
    const totalPriceWithFee = totalPrice + serviceFee;

    // 建立訂單
    const newOrder = new Order({
      ...req.body,
      userId,
      totalPrice: totalPriceWithFee,
    });
    const savedOrder = await newOrder.save();

    notifyNewOrder(savedOrder, req.user);
    sendResponse(res, 201, savedOrder);
  } catch (error) {
    return next(errorMessage(500, "新訂單: Error", error));
  }
};



//根據 ID 取得單一訂單（含 hotel、room）
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



// 更新訂單（by id）
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



// 刪除訂單(釋放庫存)（by id）
export const deleteOrder = async (req, res, next) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return next(errorMessage(404, "訂單不存在"));

    const { roomId, checkInDate, checkOutDate } = deletedOrder;
    if (roomId && checkInDate && checkOutDate) {
      const start = parseISO(checkInDate);
      const end = parseISO(checkOutDate);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, "yyyy-MM-dd");
        await RoomInventory.findOneAndUpdate(
          { roomId, date: dateStr },
          { $inc: { bookedRooms: -1 } }
        );
      }
    }

    sendResponse(res, 200, null, { message: "訂單刪除成功，庫存已釋放" });
  } catch (error) {
    return next(errorMessage(500, "刪除訂單: Error", error));
  }
};