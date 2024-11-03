/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-11-03 13:19:18
 * @FilePath: \my-app\api\RoutesController\hotels.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Hotel from "../models/Hotel.js"
import Room from "../models/Room.js"
import { errorMessage } from "../errorMessage.js"

// 獲取所有 || 搜尋飯店資料(價格抓取rooms最便宜的)
export const getAllHotels = async (req, res, next) => {
    const { name, minPrice, maxPrice, startDate, endDate } = req.query
    let query = {}

    const minPriceNumber = Number(minPrice)
    const maxPriceNumber = Number(maxPrice)
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)


    // 根據飯店名稱進行查詢
    if (name) {
        query.name = new RegExp(name, 'i') // 使用正則表達式進行模糊匹配
    }

    try {
        // 查詢所有符合條件的飯店
        const hotels = await Hotel.find(query)

        // 更新飯店資訊
        const updatedHotels = await Promise.all(
            hotels.map(async (hotel) => {
                const roomTypes = hotel.rooms // 獲取飯店的房型ID數組

                // 查找符合日期範圍的可用房型
                const availableRooms = await Room.find({
                    roomType: { $in: roomTypes },
                    availability: {
                        $elemMatch: {
                            startDate: { $lte: startDateObj },
                            endDate: { $gte: endDateObj },
                            isAvailable: true
                        }
                    }
                })

                const cheapestRoom = availableRooms.reduce((cheapest, room) => {
                    if (!cheapest || room.price < cheapest.price) {
                        return room
                        //當前遍歷的房型比目前記錄的最便宜房型更便宜，返回當前的 room，成為新的cheapest
                    }
                    return cheapest  //當前的房型價格不低於已經找到的最便宜房型的價格，保持原來的cheapest
                }, null)

                return {
                    ...hotel._doc,
                    availableRooms, // 包含所有可用房型
                    cheapestPrice: cheapestRoom ? cheapestRoom.price : null
                    // 最便宜的房型價格渲染到hotel資料
                }
            })
        )

        // 篩選最低和最高價格 || 未設置最低和最高價格返回原資料
        const filterPriceHotels = (!isNaN(minPriceNumber) && !isNaN(maxPriceNumber))
            ? updatedHotels.filter(hotel =>
                hotel.cheapestPrice >= minPriceNumber && hotel.cheapestPrice <= maxPriceNumber
            )
            : updatedHotels

        // 返回最終的飯店資料
        res.status(200).json(filterPriceHotels)
    } catch (err) {
        next(errorMessage(500, "獲取資料失敗")) // 錯誤處理
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
