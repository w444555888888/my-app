import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import RoomInventory from "../models/RoomInventory.js";
import { subDays, format, parseISO } from "date-fns";
import { errorMessage } from "../errorMessage.js";

// 模糊搜尋飯店名稱
export const getHotelNameSuggestionsService = async ({ name }) => {
  if (!name || name.trim() === "") throw errorMessage(400, "請輸入搜尋名稱");

  return Hotel.find(
    { name: { $regex: name, $options: "i" } },
    { _id: 1, name: 1 }
  ).limit(10);
};

// 獲取所有飯店資料
export const getAllHotelsService = async () => {
  return Hotel.find({});
};

// 獲取熱門飯店
export const getPopularHotelsService = async () => {
  return Hotel.find({ popularHotel: true }).populate("rooms");
};



/**
 * 計算單個房型在日期範圍內的價格和庫存
 */
const getRoomWithInventory = (room, startDate, endDate, inventoryMap) => {
  // 總價計算
  const roomTotalPrice = room.calculateTotalPrice(startDate, endDate);

  let inventories = [];
  if (startDate && endDate) {
    const start = parseISO(startDate);
    const end = subDays(parseISO(endDate), 1);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, "yyyy-MM-dd");
      const key = `${room._id.toString()}_${dateStr}`;
      const inv = inventoryMap.get(key);
      if (inv) {
        inventories.push(inv);
      } else {
        inventories.push({
          date: dateStr,
          totalRooms: 0,
          bookedRooms: 0,
        });
      }
    }
  }

  return {
    ...room.toObject(),
    roomTotalPrice,
    inventory: inventories.map((i) => ({
      date: i.date,
      totalRooms: i.totalRooms,
      bookedRooms: i.bookedRooms,
      remainingRooms: Math.max(i.totalRooms - i.bookedRooms, 0),
    })),
  };
};




/**
 * 搜尋飯店+房型+價格範圍
 */
export const getSearchHotelsService = async (query) => {
  const { name, minPrice, maxPrice, startDate, endDate, hotelId, popular } = query;
  const minPriceNumber = Number(minPrice);
  const maxPriceNumber = Number(maxPrice);

  // 單查飯店
  const isSingleQuery =
    hotelId && !name && !minPrice && !maxPrice && !startDate && !endDate;

  if (isSingleQuery) {
    const hotel = await Hotel.findById(hotelId).populate("rooms");
    if (!hotel) throw new Error("找不到此飯店");
    return [hotel];
  }

  // 篩選飯店條件
  const hotelQuery = {};
  if (name) hotelQuery.name = { $regex: name, $options: "i" };
  if (hotelId) hotelQuery._id = hotelId;
  if (popular === "true") hotelQuery.popularHotel = true;

  const hotels = await Hotel.find(hotelQuery).populate("rooms");
  if (!hotels.length) throw new Error("找不到符合條件的飯店");

  // 3️提前抓取所有房型的庫存
  let roomIds = [];
  hotels.forEach((hotel) => {
    hotel.rooms.forEach((room) => roomIds.push(room._id));
  });

  let inventoryDocs = [];
  if (startDate && endDate) {
    const adjustedEnd = subDays(parseISO(endDate), 1);
    inventoryDocs = await RoomInventory.find({
      roomId: { $in: roomIds },
      date: {
        $gte: format(parseISO(startDate), "yyyy-MM-dd"),
        $lte: format(adjustedEnd, "yyyy-MM-dd"),
      },
    }).lean();
  }

  const inventoryMap = new Map();
  inventoryDocs.forEach((inv) => {
    const key = `${inv.roomId.toString()}_${format(new Date(inv.date), "yyyy-MM-dd")}`;
    inventoryMap.set(key, inv);
  });

  // 處理每間飯店的房型資訊
  const hotelsWithRooms = hotels.map((hotel) => {
    const updatedRooms = hotel.rooms.map((room) =>
      getRoomWithInventory(room, startDate, endDate, inventoryMap)
    );

    const cheapestPrice =
      updatedRooms.length > 0
        ? Math.min(...updatedRooms.map((r) => r.roomTotalPrice))
        : null;

    const totalHotelPrice = updatedRooms.reduce((sum, r) => sum + r.roomTotalPrice, 0);

    return {
      ...hotel.toObject(),
      availableRooms: updatedRooms,
      cheapestPrice,
      totalPrice: totalHotelPrice,
    };
  });

  // 價格篩選
  if (!isNaN(minPriceNumber) || !isNaN(maxPriceNumber)) {
    return hotelsWithRooms.filter((hotel) => {
      const price = hotel.cheapestPrice;
      if (price === null) return false;
      let isInRange = true;
      if (!isNaN(minPriceNumber)) isInRange = isInRange && price >= minPriceNumber;
      if (!isNaN(maxPriceNumber)) isInRange = isInRange && price <= maxPriceNumber;
      return isInRange;
    });
  }

  return hotelsWithRooms;
};



// 新增飯店
export const createHotelService = async (body) => {
  const newHotel = new Hotel(body);
  return newHotel.save();
};


// 取得單一飯店資料
export const getHotelService = async (id) => {
  const hotel = await Hotel.findById(id);
  if (!hotel) throw errorMessage(404, "找不到資料");
  return hotel;
};


// 更新飯店
export const updatedHotelService = async (id, body) => {
  const updated = await Hotel.findByIdAndUpdate(id, { $set: body }, { new: true });
  if (!updated) throw errorMessage(404, "修改失敗，找不到此飯店");
  return updated;
};


// 刪除飯店
export const deleteHotelService = async (id) => {
  const deleted = await Hotel.findByIdAndDelete(id);
  if (!deleted) throw errorMessage(404, "刪除失敗，找不到此飯店");
  return deleted;
};
