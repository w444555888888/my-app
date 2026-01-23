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
    const roomTotalPrice = room.calculateTotalPrice(startDate, endDate);

    let inventories = [];
    if (startDate && endDate) {
        const start = parseISO(startDate);
        const end = subDays(parseISO(endDate), 1);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = format(d, "yyyy-MM-dd");
            const key = `${room._id.toString()}_${dateStr}`;
            const inv = inventoryMap.get(key);

            inventories.push({
                date: dateStr,
                totalRooms: inv?.totalRooms ?? 0,
                bookedRooms: inv?.bookedRooms ?? 0,
                remainingRooms: Math.max(
                    (inv?.totalRooms ?? 0) - (inv?.bookedRooms ?? 0),
                    0
                ),
            });
        }
    }

    return {
        _id: room._id,
        title: room.title,
        desc: room.desc,
        maxPeople: room.maxPeople,
        service: room.service,
        roomType: room.roomType,
        roomTotalPrice,
        inventory: inventories,
    };
};


/**
 * 搜尋飯店 + 房型 + 價格範圍
 */
export const getSearchHotelsService = async (query) => {
    const { name, minPrice, maxPrice, startDate, endDate, hotelId, popular } = query;
    const minPriceNumber = Number(minPrice);
    const maxPriceNumber = Number(maxPrice);

    const isSingleQuery = hotelId && !name && !minPrice && !maxPrice && !startDate && !endDate;
    const cleanHotel = (hotel) => {
        const { __v, createdAt, updatedAt, rooms, ...rest } = hotel;
        return {
            ...rest,
            availableRooms: hotel.availableRooms,
            cheapestPrice: hotel.cheapestPrice,
            totalPrice: hotel.totalPrice,
        };
    };


    if (isSingleQuery) {
        const hotel = await Hotel.findById(hotelId)

        if (!hotel) throw new Error("找不到此飯店");

        const updatedRooms = hotel.rooms.map((room) =>
            getRoomWithInventory(room, startDate, endDate, new Map())
        );

        const cheapestPrice =
            updatedRooms.length > 0
                ? Math.min(...updatedRooms.map((r) => r.roomTotalPrice))
                : null;

        const totalHotelPrice = updatedRooms.reduce(
            (sum, r) => sum + r.roomTotalPrice,
            0
        );

        return [
            cleanHotel({
                ...hotel,
                availableRooms: updatedRooms,
                cheapestPrice,
                totalPrice: totalHotelPrice,
            }),
        ];
    }


    const hotelQuery = {};
    if (name) hotelQuery.name = { $regex: name, $options: "i" };
    if (hotelId) hotelQuery._id = hotelId;
    if (popular === "true") hotelQuery.popularHotel = true;

    const hotels = await Hotel.find(hotelQuery).populate("rooms")

    if (!hotels.length) throw new Error("找不到符合條件的飯店");


    const roomIds = hotels.flatMap((hotel) =>
        hotel.rooms.map((room) => room._id)
    );

    let inventoryDocs = [];
    if (startDate && endDate) {
        const adjustedEnd = subDays(parseISO(endDate), 1);
        inventoryDocs = await RoomInventory.find({
            roomId: { $in: roomIds },
            date: {
                $gte: format(parseISO(startDate), "yyyy-MM-dd"),
                $lte: format(adjustedEnd, "yyyy-MM-dd"),
            },
        })
    }

    const inventoryMap = new Map();
    inventoryDocs.forEach((inv) => {
        const key = `${inv.roomId}_${format(new Date(inv.date), "yyyy-MM-dd")}`;
        inventoryMap.set(key, inv);
    });


    let hotelsWithRooms = hotels.map((hotel) => {
        const updatedRooms = hotel.rooms.map((room) =>
            getRoomWithInventory(room, startDate, endDate, inventoryMap)
        );

        const cheapestPrice =
            updatedRooms.length > 0
                ? Math.min(...updatedRooms.map((r) => r.roomTotalPrice))
                : null;

        const totalHotelPrice = updatedRooms.reduce(
            (sum, r) => sum + r.roomTotalPrice,
            0
        );

        return cleanHotel({
            ...hotel.toObject(),
            availableRooms: updatedRooms,
            cheapestPrice,
            totalPrice: totalHotelPrice,
        });
    });

    // 價格篩選（維持你原本邏輯）
    if (!isNaN(minPriceNumber) || !isNaN(maxPriceNumber)) {
        hotelsWithRooms = hotelsWithRooms.filter((hotel) => {
            const price = hotel.cheapestPrice;
            if (price === null) return false;
            if (!isNaN(minPriceNumber) && price < minPriceNumber) return false;
            if (!isNaN(maxPriceNumber) && price > maxPriceNumber) return false;
            return true;
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
