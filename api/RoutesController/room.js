import Hotel from "../models/Hotel.js"
import Room from "../models/Room.js"
import { errorMessage } from "../errorMessage.js"
import { sendResponse } from "../sendResponse.js"
// 創建房型
export const createRoom = async (req, res, next) => {
  const newRoom = new Room(req.body)

  try {
    const saveRoom = await newRoom.save()
    sendResponse(res, 200, saveRoom);
  } catch (error) {
    return next(errorMessage(500, "房型創建失敗，可能為格式錯誤", error))
  }
}

// 更新房型
export const updatedRoom = async (req, res, next) => {
  const roomId = req.params.id

  try {
    const updatedRoom = await Room.findByIdAndUpdate(roomId, { $set: req.body }, { new: true })
    sendResponse(res, 200, updatedRoom);
  } catch (error) {
    return next(errorMessage(500, "房型更新失敗，可能為格式錯誤或找不到其 ID", error))
  }
}

// 刪除房型
export const deleteRoom = async (req, res, next) => {
  const roomId = req.params.id

  try {
    await Room.findByIdAndDelete(roomId)
    sendResponse(res, 200, null, { message: "成功刪除房型資訊" });
  } catch (error) {
    return next(errorMessage(500, "刪除房型失敗，找不到其 ID", error))
  }
}


// 獲取所有房型
export const getAllRooms = async (req, res, next) => {
  try {
    const getRooms = await Room.find()
    sendResponse(res, 200, getRooms);
  } catch (error) {
    return next(errorMessage(500, "搜尋失敗，為資料庫變動問題", error))
  }
}


// 獲取特定id飯店的所有房型
export const getHotelRooms = async (req, res, next) => {
  const hotelId = req.params.hotelId;

  try {
    const hoteldata = await Hotel.findById(hotelId);
    if (!hoteldata) {
      return next(errorMessage(404, "找不到該飯店"));
    }
    const roomsList = await Room.find({ hotelId });
    sendResponse(res, 200, roomsList);
  } catch (error) {
    return next(errorMessage(500, "找尋房型時發生錯誤，可能為 Room 資料庫問題", error));
  }
};
