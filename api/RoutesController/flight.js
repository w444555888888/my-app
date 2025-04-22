import { errorMessage } from "../errorMessage.js"
import { sendResponse } from "../sendResponse.js"
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from "luxon";
import Flight from "../models/Flight.js"
import City from "../models/City.js"
import FlightOrder from "../models/FightOrder.js"

// 創建新航班
export const createFlight = async (req, res, next) => {
    try {
        const existing = await Flight.findOne({ flightNumber: req.body.flightNumber });
        if (existing) {
            return next(errorMessage(400, "flightNumber已存在"));
        }

        const { route, schedules } = req.body;
        const { departureCity } = route;

        // 出發城市的時區
        const city = await City.findOne({ name: departureCity });
        if (!city) {
            return next(errorMessage(404, `找不到城市時區資訊：${departureCity}`));
        }

        const timeZone = city.timeZone; // IANA 時區字串

        // 處理每一筆 schedule 的 departureDate
        const fixedSchedules = schedules.map(schedule => {
            const localDT = DateTime.fromISO(schedule.departureDate, { zone: timeZone });
            //「當地時間」轉為 UTC 格式儲存
            const fixedDepartureUTC = localDT.toUTC().toJSDate();
            return {
                ...schedule,
                departureDate: fixedDepartureUTC
            };
        });

        const newFlight = new Flight({
            ...req.body,
            schedules: fixedSchedules
        });

        const savedFlight = await newFlight.save();
        return sendResponse(res, 201, savedFlight, "航班創建成功");
    } catch (err) {
        next(errorMessage(400, "創建航班失敗", err));
    }
};

// 獲取所有航班列表 || 日期 || 起飛城市 || 目的城市
export const getAllFlights = async (req, res, next) => {
    try {
        const { departureCity, arrivalCity, startDate, endDate } = req.query;

        let query = {};

        if (departureCity) {
            query['route.departureCity'] = departureCity;
        }

        if (arrivalCity) {
            query['route.arrivalCity'] = arrivalCity;
        }

        const flights = await Flight.find(query);

        let filteredFlights = flights.map(flight => {
            let filteredSchedules = flight.schedules;

            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);

                filteredSchedules = flight.schedules.filter(schedule => {
                    const date = new Date(schedule.departureDate);
                    return date >= start && date <= end;
                });
            }

            return {
                _id: flight._id,
                flightNumber: flight.flightNumber,
                route: flight.route,
                schedules: filteredSchedules
            };
        }).filter(flight => flight.schedules.length > 0); // 移除沒有符合時間的航班

        return sendResponse(res, 200, filteredFlights, "獲取航班列表成功");
    } catch (err) {
        next(errorMessage(500, "獲取航班列表失敗", err));
    }
};


// 獲取單個航班詳情
export const getFlight = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return next(errorMessage(404, "找不到該航班"));
        }

        let filteredSchedules = flight.schedules;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            filteredSchedules = flight.schedules.filter(schedule => {
                const date = new Date(schedule.departureDate);
                return date >= start && date <= end;
            });
        }

        // 格式化 + 計算價格
        const formattedSchedules = filteredSchedules.map(schedule => {
            const departureDate = new Date(schedule.departureDate);
            const arrivalDate = new Date(schedule.arrivalDate);

            // 計算每個艙等的實際價格
            const prices = {};
            flight.cabinClasses.forEach(cabin => {
                const rawPrice = flight.calculateFinalPrice(cabin.category, departureDate);
                prices[cabin.category] = Math.round(rawPrice); //四捨五入價格
            });

            return {
                departureDate: departureDate.toISOString(),
                arrivalDate: arrivalDate.toISOString(),
                availableSeats: schedule.availableSeats,
                prices
            };
        });

        return sendResponse(res, 200, {
            _id: flight._id,
            flightNumber: flight.flightNumber,
            route: flight.route,
            schedules: formattedSchedules
        }, "獲取航班詳情成功");

    } catch (err) {
        next(errorMessage(500, "獲取航班詳情失敗", err));
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
            next(errorMessage(404, "找不到該航班"));
        }
        return sendResponse(res, 200, updatedFlight, "航班更新成功");
    } catch (err) {
        next(errorMessage(500, "更新航班失敗", err));
    }
};

// 刪除航班
export const deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        if (!flight) {
            next(errorMessage(404, "找不到該航班"));
        }
        return sendResponse(res, 200, flight, "航班刪除成功");
    } catch (err) {
        next(errorMessage(500, "刪除航班失敗", err));
    }
};

// 計算航班票價
export const calculatePrice = async (req, res) => {
    try {
        const { flightId, category, departureDate } = req.query;
        const flight = await Flight.findById(flightId);

        if (!flight) {
            next(errorMessage(404, "找不到該航班"));
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
        next(errorMessage(500, "計算票價失敗", err));
    }
};

// 查詢可用座位
export const checkSeats = async (req, res) => {
    try {
        const { flightId, departureDate } = req.query;
        const flight = await Flight.findById(flightId);

        if (!flight) {
            next(errorMessage(404, "找不到該航班"));
        }

        const schedule = flight.schedules.find(s =>
            s.departureDate.toISOString().split('T')[0] === departureDate
        );

        if (!schedule) {
            next(errorMessage(404, "找不到該日期的航班班次"));
        }

        return sendResponse(res, 200, schedule.availableSeats, "查詢座位成功");
    } catch (err) {
        next(errorMessage(500, "查詢座位失敗", err));
    }
};



// 創建航班訂單
export const createFlightOrder = async (req, res) => {
    try {
        const { flightId, category, departureDate, passengerInfo } = req.body;

        // 檢查用戶身份
        if (!req.user || !req.user.id) {
            next(errorMessage(401, "未登入或登入已過期"));
        }
        const userId = req.user.id; // 假設使用者信息從認證中間件獲取

        // 驗證乘客信息
        for (const passenger of passengerInfo) {
            if (!passenger.name || !passenger.gender || !passenger.birthDate ||
                !passenger.passportNumber || !passenger.email) {
                next(errorMessage(400, "乘客信息不完整"));
            }

            // 驗證性別值
            if (![0, 1].includes(passenger.gender)) {
                next(errorMessage(400, "性別格式不正確"));
            }

            // 驗證日期格式
            const birthDate = new Date(passenger.birthDate);
            if (isNaN(birthDate.getTime())) {
                next(errorMessage(400, "出生日期格式不正確"));
            }

            // 驗證電子郵件格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(passenger.email)) {
                next(errorMessage(400, "電子郵件格式不正確"));
            }
        }

        // 檢查航班
        const flight = await Flight.findById(flightId);
        if (!flight) {
            next(errorMessage(404, "找不到該航班"));
        }

        // 檢查座位可用性
        const schedule = flight.schedules.find(s =>
            s.departureDate.toISOString().split('T')[0] === departureDate
        );

        if (!schedule) {
            next(errorMessage(404, "該日期的航班不存在"));
        }

        // 檢查座位可用性
        if (schedule.availableSeats[category] < passengerInfo.length) {
            next(errorMessage(400, "座位數量不足"));
        }

        // 計算票價
        const basePrice = Math.round(flight.calculateFinalPrice(category, new Date(departureDate)));
        const tax = Math.round(basePrice * 0.1); // 假設稅率10%
        const totalPrice = Math.round((basePrice + tax) * passengerInfo.length);

        // 生成訂單號
        const orderNumber = `FO${uuidv4().split('-')[0]}`;

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
        next(errorMessage(500, "創建訂單失敗", err));
    }
};

// 獲取用戶的所有訂單
export const getUserOrders = async (req, res) => {
    try {
        // 檢查用戶身份
        if (!req.user || !req.user.id) {
            next(errorMessage(401, "未登入或登入已過期"));
        }
        const userId = req.user.id;
        const orders = await FlightOrder.find({ userId })
            .populate('flightId', 'flightNumber route')
            .sort({ createdAt: -1 });

        return sendResponse(res, 200, orders, "獲取訂單列表成功");
    } catch (err) {
        next(errorMessage(500, "獲取訂單列表失敗", err));
    }
};

// 獲取訂單詳情
export const getOrderDetail = async (req, res) => {
    try {
        const order = await FlightOrder.findById(req.params.orderId)
            .populate('flightId')
            .populate('userId', 'name email');

        if (!order) {
            next(errorMessage(404, "找不到該訂單"));
        }

        return sendResponse(res, 200, order, "獲取訂單詳情成功");
    } catch (err) {
        next(errorMessage(500, "獲取訂單詳情失敗", err));
    }
};

// 取消訂單
export const cancelOrder = async (req, res) => {
    try {
        const order = await FlightOrder.findById(req.params.orderId);
        if (!order) {
            next(errorMessage(404, "找不到該訂單"));
        }

        if (order.status !== 'PENDING') {
            next(errorMessage(400, "只能取消待付款的訂單"));
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
        next(errorMessage(500, "取消訂單失敗", err));
    }
};


