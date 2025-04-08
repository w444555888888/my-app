import { errorMessage } from "../errorMessage.js"
import { sendResponse } from "../sendResponse.js"
import Flight from "../models/Flight.js"
import FlightOrder from "../models/FightOrder.js"

// 創建新航班
export const createFlight = async (req, res) => {
    try {
        const newFlight = new Flight(req.body);
        const savedFlight = await newFlight.save();
        return sendResponse(res, 201, savedFlight, "航班創建成功");
    } catch (err) {
        throw errorMessage(400, "創建航班失敗", err);
    }
};

// 獲取所有航班列表
export const getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find();
        return sendResponse(res, 200, flights, "獲取航班列表成功");
    } catch (err) {
        throw errorMessage(500, "獲取航班列表失敗", err);
    }
};

// 獲取單個航班詳情
export const getFlight = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            throw errorMessage(404, "找不到該航班");
        }
        return sendResponse(res, 200, flight, "獲取航班詳情成功");
    } catch (err) {
        throw errorMessage(500, "獲取航班詳情失敗", err);
    }
};

// 更新航班信息
export const updateFlight = async (req, res) => {
    try {
        const updatedFlight = await Flight.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedFlight) {
            throw errorMessage(404, "找不到該航班");
        }
        return sendResponse(res, 200, updatedFlight, "航班更新成功");
    } catch (err) {
        throw errorMessage(500, "更新航班失敗", err);
    }
};

// 刪除航班
export const deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        if (!flight) {
            throw errorMessage(404, "找不到該航班");
        }
        return sendResponse(res, 200, flight, "航班刪除成功");
    } catch (err) {
        throw errorMessage(500, "刪除航班失敗", err);
    }
};

// 計算航班票價
export const calculatePrice = async (req, res) => {
    try {
        const { flightId, category, departureDate } = req.query;
        const flight = await Flight.findById(flightId);

        if (!flight) {
            throw errorMessage(404, "找不到該航班");
        }

        const finalPrice = flight.calculateFinalPrice(
            category,
            new Date(departureDate)
        );

        return sendResponse(res, 200, {
            flightId,
            category,
            departureDate,
            finalPrice
        }, "票價計算成功");
    } catch (err) {
        throw errorMessage(500, "計算票價失敗", err);
    }
};

// 查詢可用座位
export const checkSeats = async (req, res) => {
    try {
        const { flightId, departureDate } = req.query;
        const flight = await Flight.findById(flightId);

        if (!flight) {
            throw errorMessage(404, "找不到該航班");
        }

        const schedule = flight.schedules.find(s =>
            s.departureDate.toISOString().split('T')[0] === departureDate
        );

        if (!schedule) {
            throw errorMessage(404, "找不到該日期的航班班次");
        }

        return sendResponse(res, 200, schedule.availableSeats, "查詢座位成功");
    } catch (err) {
        throw errorMessage(500, "查詢座位失敗", err);
    }
};



// 創建航班訂單
export const createFlightOrder = async (req, res) => {
    try {
        const { flightId, category, departureDate, passengerInfo } = req.body;

        // 檢查用戶身份
        if (!req.user || !req.user.id) {
            throw errorMessage(401, "未登入或登入已過期");
        }
        const userId = req.user.id; // 假設使用者信息從認證中間件獲取

        // 檢查航班
        const flight = await Flight.findById(flightId);
        if (!flight) {
            throw errorMessage(404, "找不到該航班");
        }

        // 檢查座位可用性
        const schedule = flight.schedules.find(s =>
            s.departureDate.toISOString().split('T')[0] === departureDate
        );
        if (!schedule || schedule.availableSeats[category] < passengerInfo.length) {
            throw errorMessage(400, "座位數量不足");
        }

        // 計算票價
        const basePrice = flight.calculateFinalPrice(category, new Date(departureDate));
        const tax = basePrice * 0.1; // 假設稅率10%
        const totalPrice = (basePrice + tax) * passengerInfo.length;

        // 生成訂單號
        const orderNumber = `FO${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // 創建訂單
        const newOrder = new FlightOrder({
            userId,
            flightId,
            orderNumber,
            passengerInfo,
            category,
            departureDate,
            price: {
                basePrice,
                tax,
                totalPrice
            }
        });

        const savedOrder = await newOrder.save();

        // 更新航班座位數
        schedule.availableSeats[category] -= passengerInfo.length;
        await flight.save();

        return sendResponse(res, 201, savedOrder, "訂單創建成功");
    } catch (err) {
        throw errorMessage(500, "創建訂單失敗", err);
    }
};

// 獲取用戶的所有訂單
export const getUserOrders = async (req, res) => {
    try {
        // 檢查用戶身份
        if (!req.user || !req.user.id) {
            throw errorMessage(401, "未登入或登入已過期");
        }
        const userId = req.user.id;
        const orders = await FlightOrder.find({ userId })
            .populate('flightId', 'flightNumber route')
            .sort({ createdAt: -1 });

        return sendResponse(res, 200, orders, "獲取訂單列表成功");
    } catch (err) {
        throw errorMessage(500, "獲取訂單列表失敗", err);
    }
};

// 獲取訂單詳情
export const getOrderDetail = async (req, res) => {
    try {
        const order = await FlightOrder.findById(req.params.orderId)
            .populate('flightId')
            .populate('userId', 'name email');

        if (!order) {
            throw errorMessage(404, "找不到該訂單");
        }

        return sendResponse(res, 200, order, "獲取訂單詳情成功");
    } catch (err) {
        throw errorMessage(500, "獲取訂單詳情失敗", err);
    }
};

// 取消訂單
export const cancelOrder = async (req, res) => {
    try {
        const order = await FlightOrder.findById(req.params.orderId);
        if (!order) {
            throw errorMessage(404, "找不到該訂單");
        }

        if (order.status !== 'PENDING') {
            throw errorMessage(400, "只能取消待付款的訂單");
        }

        order.status = 'CANCELLED';
        await order.save();

        // 恢復航班座位
        const flight = await Flight.findById(order.flightId);
        const schedule = flight.schedules.find(s =>
            s.departureDate.toISOString().split('T')[0] ===
            order.departureDate.toISOString().split('T')[0]
        );
        schedule.availableSeats[order.category] += order.passengerInfo.length;
        await flight.save();

        return sendResponse(res, 200, order, "訂單取消成功");
    } catch (err) {
        throw errorMessage(500, "取消訂單失敗", err);
    }
};


