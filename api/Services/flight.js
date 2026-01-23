import Flight from "../models/Flight.js";
import FlightOrder from "../models/FlightOrder.js";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
import { getTimeZoneByCity } from "../utils/getTimeZoneByCity.js";
import { calculateFlightDuration } from "../utils/calculateFlightDuration.js";

/**
 * Flight 相關 Service
 */

// 創建新航班
export const createFlightService = async (flightData) => {
  const { route, schedules, cabinClasses, flightNumber } = flightData;

  const existing = await Flight.findOne({ flightNumber });
  if (existing) return { error: "flightNumber已存在" };

  const timeZone = getTimeZoneByCity(route.departureCity);
  if (!timeZone) return { error: `找不到城市時區資訊：${route.departureCity}` };

  const autoDuration = calculateFlightDuration(route.departureCity, route.arrivalCity);
  if (!autoDuration) return { error: "無法自動推算 flightDuration" };

  route.flightDuration = autoDuration;

  const fixedSchedules = schedules.map((schedule) => {
    const localDT = DateTime.fromISO(schedule.departureDate, { zone: timeZone });
    const fixedDepartureUTC = localDT.toUTC().toJSDate();

    const availableSeats = {};
    cabinClasses.forEach((cabin) => {
      availableSeats[cabin.category] = cabin.totalSeats;
    });

    return { departureDate: fixedDepartureUTC, availableSeats };
  });

  const newFlight = new Flight({ ...flightData, schedules: fixedSchedules });
  const savedFlight = await newFlight.save();

  return savedFlight;
};

// 更新航班
export const updateFlightService = async (id, updateData) => {
  const flight = await Flight.findById(id);
  if (!flight) return { error: "找不到該航班" };

  if (updateData.route?.departureCity) {
    const timeZone = getTimeZoneByCity(updateData.route.departureCity);
    if (!timeZone) return { error: `找不到城市時區資訊：${updateData.route.departureCity}` };
    flight.route.departureCity = updateData.route.departureCity;
  }

  if (updateData.cabinClasses && updateData.cabinClasses.length > 0) {
    flight.cabinClasses = updateData.cabinClasses;
  }

  if (updateData.route?.departureCity && updateData.route?.arrivalCity) {
    const autoDuration = calculateFlightDuration(updateData.route.departureCity, updateData.route.arrivalCity);
    if (!autoDuration) return { error: "無法自動推算 flightDuration" };
    flight.route.flightDuration = autoDuration;
    flight.route.arrivalCity = updateData.route.arrivalCity;
  }

  if (updateData.schedules && updateData.schedules.length > 0 && flight.route?.departureCity) {
    const depTZ = getTimeZoneByCity(flight.route.departureCity);
    const updatedSchedules = updateData.schedules.map((schedule) => {
      const localDateTime = DateTime.fromISO(schedule.departureDate, { zone: depTZ });
      const availableSeats = {};
      if (flight.cabinClasses) {
        for (const cabin of flight.cabinClasses) availableSeats[cabin.category] = cabin.totalSeats;
      }
      return { ...schedule, departureDate: localDateTime.toUTC().toJSDate(), availableSeats };
    });
    flight.schedules = updatedSchedules;
  }

  const updatedFlight = await flight.save();
  return updatedFlight;
};

// 取得所有航班
export const getAllFlightsService = async (queryParams) => {
  const { departureCity, arrivalCity, startDate, endDate } = queryParams;
  let query = {};
  const isSearchMode = departureCity || arrivalCity || startDate || endDate;

  if (isSearchMode && (!departureCity || !arrivalCity || !startDate || !endDate)) {
    return { error: "搜尋航班需要同時提供：出發地、目的地、起始時間、結束時間" };
  }

  if (isSearchMode) {
    query["route.departureCity"] = departureCity;
    query["route.arrivalCity"] = arrivalCity;
  }

  const flights = await Flight.find(query);
  return flights;
};

// 取得單個航班
export const getFlightService = async (id) => {
  const flight = await Flight.findById(id);
  if (!flight) return { error: "找不到該航班" };
  return flight;
};

// 刪除航班
export const deleteFlightService = async (id) => {
  const flight = await Flight.findByIdAndDelete(id);
  if (!flight) return { error: "找不到該航班" };
  return flight;
};

/**
 * FlightOrder 相關 Service
 */

// 創建訂單
export const createFlightOrderService = async (userId, orderData) => {
  const { flightId, category, scheduleId, passengerInfo } = orderData;

  const flight = await Flight.findById(flightId);
  if (!flight) return { error: "找不到該航班" };

  const schedule = flight.schedules.id(scheduleId);
  if (!schedule) return { error: "找不到該航班班次" };

  if (schedule.availableSeats[category] < passengerInfo.length) {
    return { error: "座位數量不足" };
  }

  const basePrice = Math.round(flight.calculateFinalPrice(category, new Date(schedule.departureDate)));
  const tax = Math.round(basePrice * 0.1);
  const totalPrice = Math.round((basePrice + tax) * passengerInfo.length);

  const orderNumber = `FO${uuidv4().split("-")[0]}`;

  const newOrder = new FlightOrder({
    userId,
    flightId,
    orderNumber,
    passengerInfo,
    category,
    scheduleId: schedule._id,
    price: { basePrice, tax, totalPrice },
  });

  const savedOrder = await newOrder.save();
  schedule.availableSeats[category] -= passengerInfo.length;
  await flight.save();

  return savedOrder;
};

// 取得用戶訂單
export const getUserOrdersService = async (userId) => {
  const orders = await FlightOrder.find({ userId }).populate("flightId", "flightNumber route").sort({ createdAt: -1 });
  return orders;
};

// 取得訂單詳情
export const getOrderDetailService = async (orderId) => {
  const order = await FlightOrder.findById(orderId).populate("flightId").populate("userId", "name email");
  if (!order) return { error: "找不到該訂單" };
  return order;
};

// 取消訂單
export const cancelOrderService = async (userId, orderId) => {
  const order = await FlightOrder.findById(orderId);
  if (!order) return { error: "找不到該訂單" };
  if (order.userId.toString() !== userId) return { error: "無權限取消此訂單" };
  if (order.status !== "PENDING") return { error: "只能取消待付款的訂單" };

  const flight = await Flight.findById(order.flightId);
  const schedule = flight.schedules.id(order.scheduleId);
  order.status = "CANCELLED";
  await order.save();
  schedule.availableSeats[order.category] += order.passengerInfo.length;
  await flight.save();

  return order;
};


// 後台用：獲取全部機票訂單
export const getAllFlightOrdersService = async () => {
  const orders = await FlightOrder.find();
  return orders;
};