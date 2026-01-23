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

// 搜尋飯店資料
export const getSearchHotelsService = async (query) => {
  const { name, minPrice, maxPrice, startDate, endDate, hotelId, popular } = query;
  const minPriceNumber = Number(minPrice);
  const maxPriceNumber = Number(maxPrice);

  const isSingleQuery = hotelId && !name && !minPrice && !maxPrice && !startDate && !endDate;
  if (isSingleQuery) {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) throw errorMessage(404, "找不到此飯店");
    return [hotel];
  }

  const q = {};
  if (name) q.name = { $regex: name, $options: "i" };
  if (hotelId) q._id = hotelId;
  if (popular === "true") q.popularHotel = true;

  const hotels = await Hotel.find(q).populate("rooms");
  if (!hotels.length) throw errorMessage(404, "找不到符合條件的飯店");

  const updatedHotels = await Promise.all(
    hotels.map(async (hotel) => {
      const hotelRooms = hotel.rooms || [];
      let cheapestPrice = null;
      let totalHotelPrice = 0;

      const updatedRooms = await Promise.all(
        hotelRooms.map(async (room) => {
          const roomTotalPrice = room.calculateTotalPrice(startDate, endDate);

          const inventoryQuery = { roomId: room._id };
          if (startDate && endDate) {
            const adjustedEnd = subDays(parseISO(endDate), 1);
            inventoryQuery.date = {
              $gte: format(parseISO(startDate), "yyyy-MM-dd"),
              $lte: format(adjustedEnd, "yyyy-MM-dd"),
            };
          }

          const inventories = await RoomInventory.find(inventoryQuery).sort({ date: 1 }).lean();

          if (cheapestPrice === null || roomTotalPrice < cheapestPrice) cheapestPrice = roomTotalPrice;
          totalHotelPrice += roomTotalPrice;

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
        })
      );

      return {
        ...hotel.toObject(),
        availableRooms: updatedRooms,
        totalPrice: totalHotelPrice,
        cheapestPrice,
      };
    })
  );

  // 價格篩選
  const filteredHotels =
    !isNaN(minPriceNumber) || !isNaN(maxPriceNumber)
      ? updatedHotels.filter((hotel) => {
          const price = hotel.cheapestPrice;
          let isInRange = true;
          if (!isNaN(minPriceNumber)) isInRange = isInRange && price >= minPriceNumber;
          if (!isNaN(maxPriceNumber)) isInRange = isInRange && price <= maxPriceNumber;
          return isInRange;
        })
      : updatedHotels;

  return filteredHotels;
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
