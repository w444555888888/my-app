import { getIO } from "./index.js";

/**
 * 新訂單通知
 * @param {Object} order - 訂單資料（從 DB 儲存後取得）
 * @param {Object} user - 下單使用者（可選）
 *
 * 功能：
 *  - 通知後台管理員有新訂單
 *  - 通知其他使用者該房間暫時被鎖定
 */

export const notifyNewOrder = (order, user) => {
    const io = getIO();

    io.emit("new-order", {
        orderId: order._id,
        hotelId: order.hotelId,
        roomId: order.roomId,
        totalPrice: order.totalPrice,
        userName: user?.id,
        createdAt: order.createdAt,
    });
}