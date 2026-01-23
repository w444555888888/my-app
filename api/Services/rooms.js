import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import RoomInventory from "../models/RoomInventory.js";
import { errorMessage } from "../errorMessage.js";

// 建立房型
export const createRoomService = async (body) => {
  const newRoom = new Room(body);
  return await newRoom.save();
};

// 更新房型
export const updatedRoomService = async (roomId, body) => {
  const updatedRoom = await Room.findByIdAndUpdate(roomId, { $set: body }, { new: true });
  if (!updatedRoom) throw errorMessage(404, "找不到該房型");

  const inventories = await RoomInventory.find({ roomId }).sort({ date: 1 }).lean();

  return {
    ...updatedRoom.toObject(),
    inventory: inventories.map(inv => ({
      date: inv.date,
      totalRooms: inv.totalRooms ?? 0,
      bookedRooms: inv.bookedRooms ?? 0,
      remainingRooms: Math.max((inv.totalRooms ?? 0) - (inv.bookedRooms ?? 0), 0)
    }))
  };
};

// 刪除房型（含庫存）
export const deleteRoomService = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) throw errorMessage(404, "找不到該房型");

  await Room.findByIdAndDelete(roomId);
  await RoomInventory.deleteMany({ roomId });
};

// 取得全部房型
export const getAllRoomsService = async () => {
  return Room.find();
};

// 根據飯店 ID 取得房型列表（含庫存）
export const getHotelRoomsService = async (hotelId) => {
  const hotelData = await Hotel.findById(hotelId);
  if (!hotelData) throw errorMessage(404, "找不到該飯店");

  const rooms = await Room.find({ hotelId });

  const result = await Promise.all(
    rooms.map(async (room) => {
      const inventories = await RoomInventory.find({ roomId: room._id }).sort({ date: 1 }).lean();
      const inventory = inventories.map(inv => ({
        date: inv.date,
        totalRooms: inv.totalRooms ?? 0,
        bookedRooms: inv.bookedRooms ?? 0,
        remainingRooms: Math.max((inv.totalRooms ?? 0) - (inv.bookedRooms ?? 0), 0),
        missing: false
      }));
      return { ...room.toObject(), inventory };
    })
  );

  return result;
};

// 批次更新房間庫存
export const updateRoomInventoryService = async (updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw errorMessage(400, "缺少更新內容");
  }

  for (const { roomId, date, totalRooms } of updates) {
    if (!roomId || !date) continue;
    await RoomInventory.updateOne(
      { roomId, date },
      { $set: { totalRooms } },
      { upsert: true }
    );
  }
};
