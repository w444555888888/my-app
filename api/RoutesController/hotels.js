/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-18 21:13:43
 * @FilePath: \my-app\api\RoutesController\hotels.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Hotel from "../models/Hotel.js"
import Room from "../models/Room.js"
import { errorMessage } from "../errorMessage.js"

// 獲取所有 || 搜尋飯店資料(價格抓取rooms最便宜的)
export const getAllHotels = async (req, res, next) => {
    const { name, minPrice, maxPrice } = req.query
    let query = {}

    const minPriceNumber = Number(minPrice)
    const maxPriceNumber = Number(maxPrice)

    if (name) {
        query.name = new RegExp(name, 'i')
    }

    try {
        // 所有符合查詢的飯店
        const hotels = await Hotel.find(query)

        // 迴圈飯店，查找最低價的房間
        const updatedHotels = await Promise.all(
            hotels.map(async (e) => {
                const roomTypes = e.rooms // e.rooms的數組
                const cheapestRoom = await Room.find({ roomType: { $in: roomTypes } })
                    .sort({ price: 1 }) // 升序排序
                    .limit(1) // 找最便宜第一個
                const filterRoom = await Room.find({ roomType: { $in: roomTypes } })
                    .sort({ price: 1 }) // 升序排序

                // 返回帶有最便宜的價格
                return {
                    ...e._doc, //._doc = Mongoose 模型中的原始对象
                    filterRoom,
                    cheapestPrice: cheapestRoom.length > 0 ? cheapestRoom[0].price : null, // 設置最低房間價格
                }
            })
        )


        // 如果有最低最高價格區間，!isNaN判斷是否為數字
        const filterPriceHotels = (!isNaN(minPriceNumber) && !isNaN(maxPriceNumber))
            ? updatedHotels.filter(hotel =>
                hotel.cheapestPrice >= minPriceNumber && hotel.cheapestPrice <= maxPriceNumber
            )
            : updatedHotels


        res.status(200).json(filterPriceHotels)
    } catch (err) {
        next(errorMessage(500, "獲取資料失敗"))
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
