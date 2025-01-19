/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-01-18 16:03:28
 * @FilePath: \my-app\api\RoutesController\hotels.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Hotel from "../models/Hotel.js"
import Room from "../models/Room.js"
import { errorMessage } from "../errorMessage.js"

// 獲取所有 || 搜尋飯店資料(價格抓取rooms最便宜的)
export const getAllHotels = async (req, res, next) => {
    const { name, minPrice, maxPrice, startDate, endDate } = req.query

    // 都沒有提供則回傳所有飯店
    if (!name && !minPrice && !maxPrice && !startDate && !endDate) {
        try {
            const hotels = await Hotel.find()
            res.status(200).json(hotels)
        } catch (err) {
            next(errorMessage(500, "獲取全部飯店資料失敗")) // 錯誤處理
        }
    }


    const minPriceNumber = Number(minPrice)
    const maxPriceNumber = Number(maxPrice)
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)

    // 驗證日期參數是否合法
    if (isNaN(startDateObj) || isNaN(endDateObj)) {
        return next(errorMessage(400, "請提供有效的開始和結束日期"))
    }

    let query = {} // 查詢條件
    if (name) {
        query.name = new RegExp(name, 'i')// 根據飯店名稱進行查詢
    }

    try {
        // 查詢所有符合條件的飯店
        const hotels = await Hotel.find(query)
        // 收集所有房型ID
        const roomIds = hotels.flatMap(hotel => hotel.rooms)
        // 查找符合日期範圍的房型（合併查詢以提升性能）
        const allAvailableRooms = await Room.find({
            roomType: { $in: roomIds },
            availability: {
                $elemMatch: {
                    $or: [
                        {
                            startDate: { $lte: startDateObj },
                            endDate: { $gte: endDateObj },
                            isAvailable: true
                        },
                        {
                            startDate: { $gte: startDateObj, $lte: endDateObj },
                            isAvailable: true
                        }
                    ]
                }
            }
        })

        // 將房型按飯店ID分組
        const roomsByHotel = allAvailableRooms.reduce((acc, room) => {
            acc[room.roomType] = acc[room.roomType] || []
            acc[room.roomType].push(room)
            return acc
        }, {})

        // 更新飯店資料
        const updatedHotels = hotels.map(hotel => {
            const availableRooms = hotel.rooms.flatMap(roomId => roomsByHotel[roomId] || [])
            const cheapestRoom = availableRooms.reduce((cheapest, room) => {
                return !cheapest || room.price < cheapest.price ? room : cheapest
            }, null)

            return {
                ...hotel._doc,
                availableRooms,
                cheapestPrice: cheapestRoom ? cheapestRoom.price : null
            }
        })

        // 根據價格篩選飯店
        const filterPriceHotels = (!isNaN(minPriceNumber) && !isNaN(maxPriceNumber))
            ? updatedHotels.filter(hotel =>
                hotel.cheapestPrice >= minPriceNumber && hotel.cheapestPrice <= maxPriceNumber
            )
            : updatedHotels

        res.status(200).json(filterPriceHotels)
    } catch (err) {
        next(errorMessage(500, "查詢飯店失敗")) // 錯誤處理
    }
}


export const createHotel = async (req, res, next) => { //新增next
    const newHotel = new Hotel(req.body)
    try {
        const saveHotel = await newHotel.save()
        res.status(200).json(saveHotel)
    } catch (error) {
        next(errorMessage(500, "資料上傳錯誤請確認格式"))
    }
}
export const getHotel = async (req, res, next) => {
    const id = req.params.id
    try {
        const getHotel = await Hotel.findById(id)
        res.status(200).json(getHotel)
    } catch (error) {
        next(errorMessage(500, "找不到資料，請檢查使否有此id", error))
    }
}
export const updatedHotel = async (req, res, next) => {
    const id = req.params.id
    const body = req.body
    try {
        const updatedHotel = await Hotel.findByIdAndUpdate(id, { $set: body }, { new: true })
        res.status(200).json(updatedHotel)
    } catch (error) {
        next(errorMessage(500, "修改失敗，請確認是否有其id與是否欄位輸入格式正確", error))
    }
}
export const deleteHotel = async (req, res, next) => {
    const id = req.params.id
    try {
        await Hotel.findByIdAndDelete(id)
        res.status(200).json("刪除資料成功")
    } catch (error) {
        next(errorMessage(500, "刪除失敗，請確認是否有其id", error))
    }
}
