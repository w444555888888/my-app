import {
  getAllOrdersService,
  createOrderService,
  getOrderByIdService,
  updateOrderService,
  deleteOrderService
} from "../Services/order.js";
import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";

// 取得全部訂單
export const getAllOrders = async (req, res, next) => {
  try {
    const data = await getAllOrdersService();
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 新訂單
export const createOrder = async (req, res, next) => {
  try {
    const data = await createOrderService(req.user, req.body);
    sendResponse(res, 201, data, { message: "訂單建立成功" });
  } catch (err) {
    next(err);
  }
};

// 根據 ID 查找訂單
export const getOrderById = async (req, res, next) => {
  try {
    const data = await getOrderByIdService(req.params.id);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 更新訂單狀態
export const updateOrder = async (req, res, next) => {
  try {
    const data = await updateOrderService(req.params.id, req.body);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 刪除訂單（釋放庫存）
export const deleteOrder = async (req, res, next) => {
  try {
    const data = await deleteOrderService(req.params.id);
    sendResponse(res, 200, null, { message: "訂單刪除成功，庫存已釋放" });
  } catch (err) {
    next(err);
  }
};
