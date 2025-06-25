/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-02-11 19:40:34
 * @FilePath: \my-app\api\RoutesController\hotels.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Hotel from "../models/Hotel.js"
import Room from "../models/Room.js"
import { addDays, format, isSameDay, parseISO } from 'date-fns'
import { errorMessage } from "../errorMessage.js"
import { sendResponse } from "../sendResponse.js"


// 模糊搜尋飯店名稱
export const getHotelNameSuggestions = async (req, res, next) => {
  const { name } = req.query;

  if (!name || name.trim() === '') {
    return next(errorMessage(400, "請輸入搜尋名稱"));
  }

  try {
    const hotels = await Hotel.find(
      { name: { $regex: name, $options: 'i' } }, // 模糊比對，忽略大小寫
      { _id: 1, name: 1 } // 僅回傳 id 與 name 欄位
    ).limit(10);

    sendResponse(res, 200, hotels);
  } catch (err) {
    return next(errorMessage(500, "搜尋飯店名稱失敗", err));
  }
};

// 獲取所有飯店資料（不帶任何過濾條件）
export const getAllHotels = async (req, res, next) => {
    try {
        // 查詢所有飯店資料
        const hotels = await Hotel.find({})
        sendResponse(res, 200, hotels);
    } catch (err) {
        return next(errorMessage(500, "查詢飯店資料失敗"))
    }
}



// 查詢熱門飯店
export const getPopularHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ popularHotel: true }).populate('rooms')
    sendResponse(res, 200, hotels)
  } catch (err) {
    return next(errorMessage(500, "查詢熱門飯店失敗"))
  }
}


// 搜尋飯店資料
export const getSearchHotels = async (req, res, next) => {
  const { name, minPrice, maxPrice, startDate, endDate, hotelId, popular } = req.query
  const minPriceNumber = Number(minPrice)
  const maxPriceNumber = Number(maxPrice)

  try {
    //單查hotel，不用房型與價格
    const isSingleQuery = hotelId && !name && !minPrice && !maxPrice && !startDate && !endDate
    if (isSingleQuery) {
      const hotel = await Hotel.findById(hotelId)
      if (!hotel) return next(errorMessage(404, "找不到此飯店"))
      return sendResponse(res, 200, [hotel])
    }

    // 查詢條件
    const query = {}
    if (name) query.name = { $regex: name, $options: 'i' };
    if (hotelId) query._id = hotelId
    if (popular === 'true') query.popularHotel = true

    // 查詢飯店 + 自動帶出 rooms（用 virtual）
    const hotels = await Hotel.find(query).populate('rooms')
    if (!hotels.length) return next(errorMessage(404, "找不到符合條件的飯店"))

    // 計算房價
    const updatedHotels = hotels.map(hotel => {
      const hotelRooms = hotel.rooms || []

      let cheapestPrice = null
      let totalHotelPrice = 0

      const updatedRooms = hotelRooms.map(room => {
        const roomTotalPrice = room.calculateTotalPrice(startDate, endDate)

        if (cheapestPrice === null || roomTotalPrice < cheapestPrice) {
          cheapestPrice = roomTotalPrice
        }

        totalHotelPrice += roomTotalPrice

        return {
          ...room.toObject(),
          roomTotalPrice
        }
      })

      return {
        ...hotel.toObject(),
        availableRooms: updatedRooms,
        totalPrice: totalHotelPrice,
        cheapestPrice
      }
    })

    // 價格篩選
    const filteredHotels =
      (!isNaN(minPriceNumber) || !isNaN(maxPriceNumber))
        ? updatedHotels.filter(hotel => {
          const price = hotel.cheapestPrice
          let isInRange = true
          if (!isNaN(minPriceNumber)) isInRange = isInRange && price >= minPriceNumber
          if (!isNaN(maxPriceNumber)) isInRange = isInRange && price <= maxPriceNumber
          return isInRange
        })
        : updatedHotels

    sendResponse(res, 200, filteredHotels)
  } catch (err) {
    return next(errorMessage(500, "查詢飯店失敗"))
  }
}




export const createHotel = async (req, res, next) => { //新增next
    const newHotel = new Hotel(req.body)
    try {
        const saveHotel = await newHotel.save()

        sendResponse(res, 200, saveHotel);
    } catch (error) {
        return next(errorMessage(500, "資料上傳錯誤請確認格式"))
    }
}
export const getHotel = async (req, res, next) => {
    const id = req.params.id
    try {
        const getHotel = await Hotel.findById(id)

        sendResponse(res, 200, getHotel);
    } catch (error) {
        return next(errorMessage(500, "找不到資料，請檢查使否有此id", error))
    }
}
export const updatedHotel = async (req, res, next) => {
    const id = req.params.id
    const body = req.body
    try {
        const updatedHotel = await Hotel.findByIdAndUpdate(id, { $set: body }, { new: true })
        sendResponse(res, 200, updatedHotel);
    } catch (error) {
        return next(errorMessage(500, "修改失敗，請確認是否有其id與是否欄位輸入格式正確", error))
    }
}
export const deleteHotel = async (req, res, next) => {
    const id = req.params.id
    try {
        await Hotel.findByIdAndDelete(id)
        sendResponse(res, 200, null, { message: "刪除資料成功" });
    } catch (error) {
        return next(errorMessage(500, "刪除失敗，請確認是否有其id", error))
    }
}
