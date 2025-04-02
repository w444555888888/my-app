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

// 獲取所有飯店資料（不帶任何過濾條件）
export const getAllHotels = async (req, res, next) => {
    try {
        // 查詢所有飯店資料
        const hotels = await Hotel.find({})
        sendResponse(res, 200, hotels);
    } catch (err) {
        next(errorMessage(500, "查詢飯店資料失敗"))
    }
}


// 搜尋飯店資料
export const getSearchHotels = async (req, res, next) => {
    const { name, minPrice, maxPrice, startDate, endDate, hotelId } = req.query
    const minPriceNumber = Number(minPrice)
    const maxPriceNumber = Number(maxPrice)


    // 只有hotelId，沒有日期 && 不用顯示房型
    if (hotelId && !name && !minPrice && !maxPrice && !startDate && !endDate) {
        try {
            const hotel = await Hotel.findById(hotelId)
            if (!hotel) {
                return next(errorMessage(404, "單查詢hotel: no found  this hotel"))
            }
            sendResponse(res, 200, [hotel]);
        } catch (err) {
            return next(errorMessage(500, "單查詢hotel: Error"))
        }
    }

    let query = {}
    if (name) {
        query.name = new RegExp(name, "i")
    }

    if (hotelId) {
        query._id = hotelId
    }

    try {
        // 查詢所有符合條件的酒店
        const hotels = await Hotel.find(query)
        if (hotels.length === 0) {
            return next(errorMessage(404, "找不到符合條件的酒店"))
        }

        const hotelIds = hotels.map(hotel => hotel._id)
        // 查詢這些酒店對應的所有房型
        const allRooms = await Room.find({ hotelId: { $in: hotelIds } })

        // 按 hotelId 分組房型
        const roomsByHotel = allRooms.reduce((acc, room) => {
            acc[room.hotelId] = acc[room.hotelId] || []
            acc[room.hotelId].push(room)
            return acc
        }, {})



        // 處理每間飯店的價格計算
        const updatedHotels = hotels.map(hotel => {
            const hotelRooms = roomsByHotel[String(hotel._id)] || []
            // console.log(`Hotel ${hotel.name} has ${hotelRooms.length} room(s)`)

            let cheapestPrice = null // 🔧 確保 `cheapestPrice` 初始值正確
            let totalHotelPrice = 0

            const updatedRooms = hotelRooms.map(room => {
                let roomTotalPrice = 0

                let currentDate = parseISO(startDate)
                while (currentDate < parseISO(endDate)) {
                    const dayOfWeek = currentDate.getDay()
                    const dateString = format(currentDate, "yyyy-MM-dd")
                    let dailyPrice = null

                    const holiday = room.holidays?.find(h => h.date == dateString)
                    if (holiday) {
                        dailyPrice = holiday.price
                    }

                    if (!dailyPrice) {
                        const priceOption = room.pricing?.find(p => p.days_of_week.includes(dayOfWeek))
                        if (priceOption) {
                            dailyPrice = priceOption.price
                        }
                    }

                    if (dailyPrice !== null) {
                        roomTotalPrice += dailyPrice
                    }

                    currentDate = addDays(currentDate, 1)
                }

                if (cheapestPrice === null || roomTotalPrice < cheapestPrice) { // 🔧 修正
                    cheapestPrice = roomTotalPrice
                }

                totalHotelPrice += roomTotalPrice

                return { ...room.toObject(), roomTotalPrice }
            })

            return {
                ...hotel.toObject(),
                availableRooms: updatedRooms,
                totalPrice: totalHotelPrice,
                cheapestPrice
            }
        })

        // 根據 minPrice 和 maxPrice 過濾飯店
        const filterPriceHotels =
            !isNaN(minPriceNumber) && !isNaN(maxPriceNumber)
                ? updatedHotels.filter(
                    hotel =>
                        hotel.cheapestPrice >= minPriceNumber &&
                        hotel.cheapestPrice <= maxPriceNumber
                )
                : updatedHotels

        sendResponse(res, 200, filterPriceHotels);
    } catch (err) {
        next(errorMessage(500, "查詢飯店失敗"))
    }
}




export const createHotel = async (req, res, next) => { //新增next
    const newHotel = new Hotel(req.body)
    try {
        const saveHotel = await newHotel.save()

        sendResponse(res, 200, saveHotel);
    } catch (error) {
        next(errorMessage(500, "資料上傳錯誤請確認格式"))
    }
}
export const getHotel = async (req, res, next) => {
    const id = req.params.id
    try {
        const getHotel = await Hotel.findById(id)

        sendResponse(res, 200, getHotel);
    } catch (error) {
        next(errorMessage(500, "找不到資料，請檢查使否有此id", error))
    }
}
export const updatedHotel = async (req, res, next) => {
    const id = req.params.id
    const body = req.body
    try {
        const updatedHotel = await Hotel.findByIdAndUpdate(id, { $set: body }, { new: true })
        sendResponse(res, 200, updatedHotel);
    } catch (error) {
        next(errorMessage(500, "修改失敗，請確認是否有其id與是否欄位輸入格式正確", error))
    }
}
export const deleteHotel = async (req, res, next) => {
    const id = req.params.id
    try {
        await Hotel.findByIdAndDelete(id)
        sendResponse(res, 200, null,{ message: "刪除資料成功" });
    } catch (error) {
        next(errorMessage(500, "刪除失敗，請確認是否有其id", error))
    }
}
