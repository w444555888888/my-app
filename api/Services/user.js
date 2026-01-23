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

    // 只抓前端需要的 user 欄位
    const user = await User.findById(userId)
        .select("_id username realName address phoneNumber")
        .lean();

    if (!user) throw errorMessage(404, "用戶未找到");

    // 飯店訂單，只選需要欄位
    const allOrder = await Order.find({ userId })
        .select("_id hotelId roomId checkInDate checkOutDate totalPrice status payment")
        .lean();

    // 航班訂單
    const rawFlightOrders = await FlightOrder.find({ userId })
        .populate("flightId", "flightNumber route schedules") // 只帶必要欄位
        .sort({ createdAt: -1 })
        .lean();

    // map 轉成前端需要的欄位
    const allFlightOrder = rawFlightOrders.map(order => {
        const flight = order.flightId;
        if (!flight) return null;

        const schedule = flight.schedules.find(s => s._id.toString() === order.scheduleId.toString());

        return {
            _id: order._id,
            flightNumber: flight.flightNumber,
            route: flight.route,
            category: order.category,
            schedule: schedule
                ? {
                    _id: schedule._id,
                    departureDate: schedule.departureDate,
                    arrivalDate: schedule.arrivalDate,
                    price: schedule.prices?.[order.category] ?? null,
                }
                : null,
            passengerInfo: order.passengerInfo.map(p => ({
                name: p.name,
                gender: p.gender,
                birthDate: p.birthDate,
            })),
            price: order.price,
            status: order.status,
            orderNumber: order.orderNumber,
        };
    }).filter(Boolean);

    return { ...user, allOrder, allFlightOrder };
};


// 取得全部使用者（限管理員）
export const getAllUsersService = async (currentUser) => {
    if (!currentUser.isAdmin) {
        throw errorMessage(403, "只有管理員可以查看所有用戶資料");
    }

    return User.find();
};
