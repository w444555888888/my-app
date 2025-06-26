import { errorMessage } from "../errorMessage.js";
import { sendResponse } from "../sendResponse.js";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
import Flight from "../models/Flight.js";
import FlightOrder from "../models/FightOrder.js";
import { getTimeZoneByCity } from "../utils/getTimeZoneByCity.js";
import { calculateFlightDuration } from '../utils/calculateFlightDuration.js';


// 創建新航班
export const createFlight = async (req, res, next) => {
  try {
    const existing = await Flight.findOne({
      flightNumber: req.body.flightNumber,
    });
    if (existing) {
      return next(errorMessage(400, "flightNumber已存在"));
    }

    const { route, schedules, cabinClasses } = req.body;
    const { departureCity } = route;

    if (!cabinClasses) {
      return next(errorMessage(400, "缺少 cabinClasses"));
    }

    // 出發城市的時區
    const timeZone = getTimeZoneByCity(departureCity);
    if (!timeZone) {
      return next(errorMessage(404, `找不到城市時區資訊：${departureCity}`));
    }

    // 自動計算飛行時間
    const autoDuration = calculateFlightDuration(route.departureCity, route.arrivalCity);
    if (!autoDuration) {
      return next(errorMessage(400, "無法自動推算 flightDuration，請確認城市名稱是否正確"));
    }
    route.flightDuration = autoDuration;

    // 自動產生每筆 schedule 的 availableSeats 和 departureDate（轉成 UTC）
    const fixedSchedules = schedules.map((schedule) => {
      // 轉換當地時間成 UTC
      const localDT = DateTime.fromISO(schedule.departureDate, {
        zone: timeZone,
      });
      const fixedDepartureUTC = localDT.toUTC().toJSDate();

      // 根據 cabinClasses 設定自動生成 availableSeats
      const availableSeats = {};
      cabinClasses.forEach((cabin) => {
        availableSeats[cabin.category] = cabin.totalSeats;
      });

      return {
        departureDate: fixedDepartureUTC,
        availableSeats,
      };
    });

    const newFlight = new Flight({
      ...req.body,
      schedules: fixedSchedules,
    });

    const savedFlight = await newFlight.save();
    return sendResponse(res, 201, savedFlight, "航班創建成功");
  } catch (err) {
    return next(errorMessage(400, "創建航班失敗", err));
  }
};

// 更新航班
export const updateFlight = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 查找現有航班
    const flight = await Flight.findById(id);
    if (!flight) {
      return next(errorMessage(404, "找不到該航班"));
    }

    // 1. 取得時區
    if (updateData.route && updateData.route.departureCity) {
      const departureCity = updateData.route.departureCity;
      const timeZone = getTimeZoneByCity(departureCity);
      if (!timeZone) {
        return next(errorMessage(400, `找不到城市時區資訊：${departureCity}`));
      }
      flight.route.departureCity = departureCity;
    }

    // 2. 優先更新艙等
    if (updateData.cabinClasses && updateData.cabinClasses.length > 0) {
      flight.cabinClasses = updateData.cabinClasses;
    }

    // 若同時提供了 arrivalCity，重新計算 flightDuration
    if (updateData.route?.departureCity && updateData.route?.arrivalCity) {
      const autoDuration = calculateFlightDuration(updateData.route.departureCity, updateData.route.arrivalCity);
      if (!autoDuration) {
        return next(errorMessage(400, "無法自動推算 flightDuration，請確認城市名稱是否正確"));
      }
      flight.route.flightDuration = autoDuration;
      flight.route.arrivalCity = updateData.route.arrivalCity;
      console.log(`[更新航班] 自動推算 ${updateData.route.departureCity} → ${updateData.route.arrivalCity} 時間為 ${autoDuration} 分鐘`);
    }

    if (
      updateData.schedules &&
      updateData.schedules.length > 0 &&
      flight.route?.departureCity
    ) {

      const depTZ = getTimeZoneByCity(flight.route.departureCity);
      if (!depTZ) {
        return next(errorMessage(400, `找不到城市時區資訊：${flight.route.departureCity}`));
      }

      const updatedSchedules = updateData.schedules.map((schedule) => {
        const localDateTime = DateTime.fromISO(schedule.departureDate, {
          zone: depTZ,
        });

        // 初始化 availableSeats
        const availableSeats = {};
        if (flight.cabinClasses && flight.cabinClasses.length > 0) {
          for (const cabin of flight.cabinClasses) {
            availableSeats[cabin.category] = cabin.totalSeats;
          }
        }

        return {
          ...schedule,
          departureDate: localDateTime.toUTC().toJSDate(),
          availableSeats,
        };
      });

      flight.schedules = updatedSchedules;
    }

    // 4. 儲存
    const updatedFlight = await flight.save();
    return sendResponse(res, 200, updatedFlight, "航班更新成功");
  } catch (error) {
    return next(errorMessage(500, error.message));
  }
};


// 獲取所有航班列表 || (日期開始 && 日期結束 && 起飛城市 && 目的城市)
export const getAllFlights = async (req, res, next) => {
  try {
    const { departureCity, arrivalCity, startDate, endDate } = req.query;

    const isSearchMode = departureCity || arrivalCity || startDate || endDate;

    if (
      isSearchMode &&
      (!departureCity || !arrivalCity || !startDate || !endDate)
    ) {
      return next(
        errorMessage(
          400,
          "搜尋航班需要同時提供：出發地、目的地、起始時間、結束時間"
        )
      );
    }

    let query = {};
    if (isSearchMode) {
      query["route.departureCity"] = departureCity;
      query["route.arrivalCity"] = arrivalCity;
    }

    const flights = await Flight.find(query);

    // 如果是搜尋模式，先獲取城市時區
    let cityTimeZone;
    if (isSearchMode) {
      const timeZone = getTimeZoneByCity(departureCity);
      if (!timeZone) {
        return next(errorMessage(400, `找不到城市時區資訊：${departureCity}`));
      }
    }

    let filteredFlights = flights
      .map((flight) => {
        let filteredSchedules = flight.schedules;

        if (isSearchMode && cityTimeZone) {
          const startUTC = DateTime.fromISO(startDate, { zone: cityTimeZone })
            .startOf("day")
            .toUTC()
            .toJSDate();
          const endUTC = DateTime.fromISO(endDate, { zone: cityTimeZone })
            .endOf("day")
            .toUTC()
            .toJSDate();

          filteredSchedules = flight.schedules.filter((schedule) => {
            const scheduleDate = new Date(schedule.departureDate);
            return scheduleDate >= startUTC && scheduleDate <= endUTC;
          });
        }

        return {
          _id: flight._id,
          flightNumber: flight.flightNumber,
          route: flight.route,
          schedules: filteredSchedules,
        };
      })
      .filter((flight) => flight.schedules.length > 0);

    return sendResponse(res, 200, filteredFlights, "獲取航班列表成功");
  } catch (err) {
    return next(errorMessage(500, "獲取航班列表失敗", err));
  }
};

// 獲取單個航班詳情
export const getFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return next(errorMessage(404, "找不到該航班"));
    }

    // 格式化 + 計算價格
    const formattedSchedules = flight.schedules.map((schedule) => {
      const departureDate = new Date(schedule.departureDate);
      const arrivalDate = new Date(schedule.arrivalDate);

      // 計算每個艙等的實際價格
      const prices = {};
      flight.cabinClasses.forEach((cabin) => {
        const rawPrice = flight.calculateFinalPrice(
          cabin.category,
          departureDate
        );
        prices[cabin.category] = Math.round(rawPrice);
      });

      return {
        departureDate: departureDate.toISOString(),
        arrivalDate: arrivalDate.toISOString(),
        availableSeats: schedule.availableSeats,
        prices,
      };
    });

    return sendResponse(
      res,
      200,
      {
        _id: flight._id,
        flightNumber: flight.flightNumber,
        route: flight.route,
        schedules: formattedSchedules,
      },
      "獲取航班詳情成功"
    );
  } catch (err) {
    return next(errorMessage(500, "獲取航班詳情失敗", err));
  }
};

// 刪除航班
export const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return next(errorMessage(404, "找不到該航班"));
    }
    return sendResponse(res, 200, flight, "航班刪除成功");
  } catch (err) {
    return next(errorMessage(500, "刪除航班失敗", err));
  }
};

/**
 * 訂票FlightOrder
 */

// 後台用：獲取全部機票訂單
export const getAllFlightOrders = async (req, res, next) => {
  try {
    const orders = await FlightOrder.find();

    return sendResponse(res, 200, orders, "獲取所有機票訂單成功");
  } catch (err) {
    return next(errorMessage(500, "獲取機票訂單失敗", err));
  }
};

// 創建航班訂單
export const createFlightOrder = async (req, res) => {
  try {
    const { flightId, category, departureDate, passengerInfo } = req.body;

    // 基本數據驗證
    if (!flightId || !category || !departureDate || !passengerInfo) {
      return next(errorMessage(400, "缺少必要的訂單信息"));
    }

    // 檢查用戶身份
    if (!req.user || !req.user.id) {
      return next(errorMessage(401, "未登入或登入已過期"));
    }
    const userId = req.user.id; // 假設使用者信息從認證中間件獲取

    // 驗證乘客信息
    for (const passenger of passengerInfo) {
      if (
        !passenger.name ||
        !passenger.gender ||
        !passenger.birthDate ||
        !passenger.passportNumber ||
        !passenger.email
      ) {
        return next(errorMessage(400, "乘客信息不完整"));
      }

      // 驗證性別值
      if (![0, 1].includes(passenger.gender)) {
        return next(errorMessage(400, "性別格式不正確"));
      }

      // 驗證日期格式和合理性
      const birthDate = new Date(passenger.birthDate);
      const today = new Date();
      if (isNaN(birthDate.getTime()) || birthDate > today) {
        return next(errorMessage(400, "出生日期格式不正確或不合理"));
      }

      // 驗證電子郵件格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(passenger.email)) {
        return next(errorMessage(400, "電子郵件格式不正確"));
      }
    }

    // 檢查航班
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return next(errorMessage(404, "找不到該航班"));
    }

    // 檢查艙等是否存在
    const validCategory = flight.cabinClasses.some(
      (c) => c.category === category
    );
    if (!validCategory) {
      return next(errorMessage(400, "無效的艙等類型"));
    }

    // timeZone
    const timeZone = getTimeZoneByCity(flight.route.departureCity);
    if (!timeZone) {
      return next(errorMessage(404, `找不到城市時區資訊：${flight.route.departureCity}`));
    }

    // 檢查航班起飛地
    // 這裡要轉換傳入的 departureDate 為 UTC
    const localDepartureDate = DateTime.fromISO(departureDate, {
      zone: timeZone,
    })
      .toUTC()
      .toJSDate();
    const schedule = flight.schedules.find(
      (s) =>
        new Date(s.departureDate).toISOString().split("T")[0] ===
        localDepartureDate.toISOString().split("T")[0]
    );

    if (!schedule) {
      return next(errorMessage(404, "該日期的航班不存在"));
    }

    // 檢查座位可用性
    if (schedule.availableSeats[category] < passengerInfo.length) {
      return next(errorMessage(400, "座位數量不足"));
    }

    // 計算票價
    const basePrice = Math.round(
      flight.calculateFinalPrice(category, new Date(departureDate))
    );
    const tax = Math.round(basePrice * 0.1); // 假設稅率10%
    const totalPrice = Math.round((basePrice + tax) * passengerInfo.length);

    // 生成訂單號
    const orderNumber = `FO${uuidv4().split("-")[0]}`;

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
        totalPrice,
      },
    });

    const savedOrder = await newOrder.save();

    // 更新航班座位數
    schedule.availableSeats[category] -= passengerInfo.length;
    await flight.save();

    return sendResponse(res, 201, savedOrder, "訂單創建成功");
  } catch (err) {
    return next(errorMessage(500, "創建訂單失敗", err));
  }
};

// 獲取用戶的所有訂單
export const getUserOrders = async (req, res) => {
  try {
    // 檢查用戶身份
    if (!req.user || !req.user.id) {
      return next(errorMessage(401, "未登入或登入已過期"));
    }
    const userId = req.user.id;
    const orders = await FlightOrder.find({ userId })
      .populate("flightId", "flightNumber route")
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, orders, "獲取訂單列表成功");
  } catch (err) {
    return next(errorMessage(500, "獲取訂單列表失敗", err));
  }
};

// 獲取訂單詳情
export const getOrderDetail = async (req, res, next) => {
  try {
    const order = await FlightOrder.findById(req.params.id)
      .populate("flightId")
      .populate("userId", "name email");

    if (!order) {
      return next(errorMessage(404, "找不到該訂單"));
    }

    return sendResponse(res, 200, order, "獲取訂單詳情成功");
  } catch (err) {
    return next(errorMessage(500, "獲取訂單詳情失敗", err));
  }
};

// 取消訂單
export const cancelOrder = async (req, res, next) => {
  try {
    // 檢查用戶身份
    if (!req.user || !req.user.id) {
      return next(errorMessage(401, "未登入或登入已過期"));
    }

    const order = await FlightOrder.findById(req.params.id);
    if (!order) {
      return next(errorMessage(404, "找不到該訂單"));
    }

    // 確認是訂單擁有者
    if (order.userId.toString() !== req.user.id) {
      return next(errorMessage(403, "無權限取消此訂單"));
    }

    if (order.status !== "PENDING") {
      return next(errorMessage(400, "只能取消待付款的訂單"));
    }

    // 檢查航班
    const flight = await Flight.findById(order.flightId);
    if (!flight) {
      return next(errorMessage(404, "找不到相關航班信息"));
    }

    // 直接比較 UTC 時間
    const schedule = flight.schedules.find(
      (s) =>
        s.departureDate.toISOString().split("T")[0] ===
        order.departureDate.toISOString().split("T")[0]
    );

    if (!schedule) {
      return next(errorMessage(404, "找不到對應航班班次"));
    }

    // 更新訂單狀態
    order.status = "CANCELLED";
    await order.save();

    // 恢復航班座位
    schedule.availableSeats[order.category] += order.passengerInfo.length;
    await flight.save();

    return sendResponse(res, 200, order, "訂單取消成功");
  } catch (err) {
    return next(errorMessage(500, "取消訂單失敗", err));
  }
};
