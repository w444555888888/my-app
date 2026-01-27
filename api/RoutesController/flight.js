import { errorMessage } from "../errorMessage.js";
import { sendResponse } from "../sendResponse.js";
import {
  createFlightService,
  updateFlightService,
  getAllFlightsService,
  getFlightService,
  deleteFlightService,
  createFlightOrderService,
  getUserOrdersService,
  getOrderDetailService,
  cancelOrderService,
  getAllFlightOrdersService
} from "../Services/flight.js";

// Flight Controller
export const createFlight = async (req, res, next) => {
  try {
    const result = await createFlightService(req.body);
    if (result.error) return next(errorMessage(400, result.error));
    return sendResponse(res, 201, result, "航班創建成功");
  } catch (err) {
    return next(errorMessage(400, "創建航班失敗", err));
  }
};

export const updateFlight = async (req, res, next) => {
  try {
    const result = await updateFlightService(req.params.id, req.body);
    if (result.error) return next(errorMessage(400, result.error));
    return sendResponse(res, 200, result, "航班更新成功");
  } catch (err) {
    return next(errorMessage(500, err.message));
  }
};

export const getAllFlights = async (req, res, next) => {
  try {
    const flights = await getAllFlightsService(req.query);
    return sendResponse(res, 200, flights, "獲取航班列表成功");
  } catch (err) {
    return next(errorMessage(500, "獲取航班列表失敗", err));
  }
};

export const getFlight = async (req, res, next) => {
  try {
    const flight = await getFlightService(req.params.id);
    if (flight.error) return next(errorMessage(404, flight.error));
    return sendResponse(res, 200, flight, "獲取航班詳情成功");
  } catch (err) {
    return next(errorMessage(500, "獲取航班詳情失敗", err));
  }
};

export const deleteFlight = async (req, res, next) => {
  try {
    const flight = await deleteFlightService(req.params.id);
    if (flight.error) return next(errorMessage(404, flight.error));
    return sendResponse(res, 200, flight, "航班刪除成功");
  } catch (err) {
    return next(errorMessage(500, "刪除航班失敗", err));
  }
};


// FlightOrder Controller
export const createFlightOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await createFlightOrderService(userId, req.body);
    if (order.error) return next(errorMessage(400, order.error));
    return sendResponse(res, 201, order, "訂單創建成功");
  } catch (err) {
    return next(errorMessage(500, "創建訂單失敗", err));
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await getUserOrdersService(req.user.id);
    return sendResponse(res, 200, orders, "獲取訂單列表成功");
  } catch (err) {
    return next(errorMessage(500, "獲取訂單列表失敗", err));
  }
};

export const getOrderDetail = async (req, res, next) => {
  try {
    const order = await getOrderDetailService(req.params.id);
    if (order.error) return next(errorMessage(404, order.error));
    return sendResponse(res, 200, order, "獲取訂單詳情成功");
  } catch (err) {
    return next(errorMessage(500, "獲取訂單詳情失敗", err));
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await cancelOrderService(req.user.id, req.params.id);
    if (order.error) return next(errorMessage(400, order.error));
    return sendResponse(res, 200, order, "訂單取消成功");
  } catch (err) {
    return next(errorMessage(500, "取消訂單失敗", err));
  }
};

// 後台用：獲取全部機票訂單
export const getAllFlightOrders = async (req, res, next) => {
  try {
    const orders = await getAllFlightOrdersService();
    return sendResponse(res, 200, orders, "獲取所有機票訂單成功");
  } catch (err) {
    return next(errorMessage(500, "獲取機票訂單失敗", err));
  }
};


