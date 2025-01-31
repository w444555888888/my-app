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
    const { name, minPrice, maxPrice } = req.query

    // 轉換為數字型態
    const minPriceNumber = Number(minPrice)
    const maxPriceNumber = Number(maxPrice)

    let query = {} // 查詢條件
    if (name) {
        query.name = new RegExp(name, 'i') // 根據飯店名稱進行查詢
    }

    try {
        // 查詢所有符合條件的飯店
        const hotels = await Hotel.find(query)

        // 查找所有符合飯店 ID 的房型
        const hotelIds = hotels.map(hotel => hotel._id)
        const allRooms = await Room.find({ hotelId: { $in: hotelIds } })

        // 將房型按 `hotelId` 分組
        const roomsByHotel = allRooms.reduce((acc, room) => {
            acc[room.hotelId] = acc[room.hotelId] || []
            acc[room.hotelId].push(room)
            return acc
        }, {})

        // 更新飯店資料，計算最便宜房型
        const updatedHotels = hotels.map(hotel => {
            const hotelRooms = roomsByHotel[hotel._id] || []
            const cheapestRoom = hotelRooms.reduce((cheapest, room) => {
                return !cheapest || room.price < cheapest.price ? room : cheapest
            }, null)

            return {
                ...hotel._doc,
                availableRooms: hotelRooms, // 該飯店所有房型
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
