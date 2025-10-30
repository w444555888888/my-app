import Hotel from "../models/Hotel.js"
import Room from "../models/Room.js"
import RoomInventory from "../models/RoomInventory.js";
import { addDays, format } from "date-fns";
import { errorMessage } from "../errorMessage.js"
import { sendResponse } from "../sendResponse.js"


// 建立房型
export const createRoom = async (req, res, next) => {
  try {
    const newRoom = new Room(req.body);
    const saveRoom = await newRoom.save();
    sendResponse(res, 200, saveRoom);
  } catch (error) {
    return next(errorMessage(500, "房型創建失敗，可能為格式錯誤", error));
  }
};


// 更新房型
export const updatedRoom = async (req, res, next) => {
  const roomId = req.params.id;

  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $set: req.body },
      { new: true }
    );
    if (!updatedRoom) {
      return next(errorMessage(404, "找不到該房型"));
    }

    // 該房型現有庫存資料
    const inventories = await RoomInventory.find({ roomId })
      .sort({ date: 1 })
      .lean();

    console.log(`[Room ${roomId}] → 撈出 ${inventories.length} 筆庫存資料`);


    sendResponse(res, 200, {
      ...updatedRoom.toObject(),
      inventory: inventories.map(inv => ({
        date: inv.date,
        totalRooms: inv.totalRooms ?? 0,
        bookedRooms: inv.bookedRooms ?? 0,
        remainingRooms: Math.max((inv.totalRooms ?? 0) - (inv.bookedRooms ?? 0), 0),
      })),
    });
  } catch (error) {
    return next(errorMessage(500, "房型更新失敗，可能為格式錯誤或找不到其 ID", error));
  }
};




// 刪除房型
export const deleteRoom = async (req, res, next) => {
  const roomId = req.params.id;

  try {
    const room = await Room.findById(roomId);
    if (!room) return next(errorMessage(404, "找不到該房型"));

    await Room.findByIdAndDelete(roomId);
    await RoomInventory.deleteMany({ roomId });

    sendResponse(res, 200, null, { message: "成功刪除房型與庫存資料" });
  } catch (error) {
    return next(errorMessage(500, "刪除房型失敗", error));
  }
};


// 取得全部房型
export const getAllRooms = async (req, res, next) => {
  try {
    const getRooms = await Room.find()
    sendResponse(res, 200, getRooms);
  } catch (error) {
    return next(errorMessage(500, "搜尋失敗，為資料庫變動問題", error))
  }
}




// 根據飯店 ID 取得房型列表.庫存
export const getHotelRooms = async (req, res, next) => {
  const hotelId = req.params.hotelId;

  try {
    const hotelData = await Hotel.findById(hotelId);
    if (!hotelData) return next(errorMessage(404, "找不到該飯店"));

    const rooms = await Room.find({ hotelId });

    const result = await Promise.all(
      rooms.map(async (room) => {
        // 查詢該房型的所有庫存紀錄
        const inventories = await RoomInventory.find({ roomId: room._id })
          .sort({ date: 1 }) // 依日期升冪排列
          .lean();

        if (!inventories.length) {
          return {
            ...room.toObject(),
            inventory: [],
          };
        }

        const inventory = inventories.map((inv) => ({
          date: inv.date,
          totalRooms: inv.totalRooms ?? 0,
          bookedRooms: inv.bookedRooms ?? 0,
          remainingRooms: Math.max((inv.totalRooms ?? 0) - (inv.bookedRooms ?? 0), 0),
          missing: false,
        }));

        return {
          ...room.toObject(),
          inventory,
        };
      })
    );

    sendResponse(res, 200, result);
  } catch (error) {
    return next(errorMessage(500, "查詢房型或庫存失敗", error));
  }
};



// 更新房間庫存
export const updateRoomInventory = async (req, res, next) => {
  const { updates } = req.body;

  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      return next(errorMessage(400, "缺少更新內容"));
    }

    for (const { roomId, date, totalRooms } of updates) {
      if (!roomId || !date) continue;

      await RoomInventory.updateOne(
        { roomId, date },
        { $set: { totalRooms } },
        { upsert: true } // 若不存在則自動建立
      );
    }

    sendResponse(res, 200, null, { message: "房間庫存更新成功" });
  } catch (error) {
    return next(errorMessage(500, "更新房間庫存失敗", error));
  }
};

