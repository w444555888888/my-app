import {
  createRoomService,
  updatedRoomService,
  deleteRoomService,
  getAllRoomsService,
  getHotelRoomsService,
  updateRoomInventoryService
} from "../Services/room.js";
import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";

// 建立房型
export const createRoom = async (req, res, next) => {
  try {
    const data = await createRoomService(req.body);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 更新房型
export const updatedRoom = async (req, res, next) => {
  try {
    const data = await updatedRoomService(req.params.id, req.body);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 刪除房型
export const deleteRoom = async (req, res, next) => {
  try {
    await deleteRoomService(req.params.id);
    sendResponse(res, 200, null, { message: "成功刪除房型與庫存資料" });
  } catch (err) {
    next(err);
  }
};

// 取得全部房型
export const getAllRooms = async (req, res, next) => {
  try {
    const data = await getAllRoomsService();
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 根據飯店 ID 取得房型列表（含庫存）
export const getHotelRooms = async (req, res, next) => {
  try {
    const data = await getHotelRoomsService(req.params.hotelId);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 批次更新房間庫存
export const updateRoomInventory = async (req, res, next) => {
  try {
    await updateRoomInventoryService(req.body.updates);
    sendResponse(res, 200, null, { message: "房間庫存更新成功" });
  } catch (err) {
    next(err);
  }
};
