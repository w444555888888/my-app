/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-02-10 00:06:33
 * @FilePath: \my-app\api\RoutesController\hotels.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Hotel from "../models/Hotel.js"
import Room from "../models/Room.js"
import { addDays, format, isSameDay, parseISO } from 'date-fns'
import { errorMessage } from "../errorMessage.js"

// 獲取所有 || 飯店資料
export const getAllHotels = async (req, res, next) => {
    const { name, minPrice, maxPrice, startDate, endDate } = req.query
    const minPriceNumber = Number(minPrice)
    const maxPriceNumber = Number(maxPrice)

    let query = {}
    if (name) {
        query.name = new RegExp(name, 'i')
    }

    try {
        const hotels = await Hotel.find(query)
        const hotelIds = hotels.map(hotel => hotel._id)
        const allRooms = await Room.find({ hotelId: { $in: hotelIds } })

        const roomsByHotel = allRooms.reduce((acc, room) => {
            acc[room.hotelId] = acc[room.hotelId] || []
            acc[room.hotelId].push(room)
            return acc
        }, {})

        const updatedHotels = hotels.map(hotel => {
            const hotelRooms = roomsByHotel[hotel._id] || []
            let cheapestPrice = Infinity  // 該 hotel 在符合條件房型中的最便宜價格總和
            let totalHotelPrice = 0  // 酒店所有房型的總價

            hotelRooms.forEach(room => {
                let roomTotalPrice = 0  // 該房型在所有日期內的總價

                // 只計算 `startDate` 到 `endDate` - 1 晚的價格
                let currentDate = parseISO(startDate)  // 住宿的第一晚
                while (currentDate < parseISO(endDate)) {
                    const dayOfWeek = currentDate.getDay()  // 當前日期的星期
                    const dateString = format(currentDate, 'yyyy-MM-dd')  // 格式化日期
                    let dailyPrice = null  // 該日的房價

                    // 先檢查該日期是否為假日
                    const holiday = room.holidays?.find(h => h.date == dateString)
                    if (holiday) {
                        dailyPrice = holiday.price  // 如果是假日，使用假日價格
                        console.log(dailyPrice,'假日');
                        
                    }else{
                        
                    }

                    // 如果不是假日，則使用對應的星期價格
                    if (!dailyPrice) {
                        const priceOption = room.pricing?.find(p => p.days_of_week.includes(dayOfWeek))
                        if (priceOption) {
                            dailyPrice = priceOption.price

                            console.log(dailyPrice,'星期');
                        }
                    }

                    // 若找到價格則累加
                    if (dailyPrice !== null) {
                        roomTotalPrice += dailyPrice
                    }

                    // 移動到下一天（這裡是計算每一晚的價格，所以只加一天）
                    currentDate = addDays(currentDate, 1)
                }

                // 取該 hotel 所有房型中最便宜的加總
                cheapestPrice = Math.min(cheapestPrice, roomTotalPrice)

                // 總酒店價格加總
                totalHotelPrice += roomTotalPrice
            })

            return {
                ...hotel._doc,
                availableRooms: hotelRooms,
                totalPrice: totalHotelPrice,  // 該 hotel 的所有房型加總價格
                cheapestPrice: cheapestPrice === Infinity ? null : cheapestPrice  // 該 hotel 的最便宜房型總價
            }
        })





        const filterPriceHotels = (!isNaN(minPriceNumber) && !isNaN(maxPriceNumber))
            ? updatedHotels.filter(hotel =>
                hotel.cheapestPrice >= minPriceNumber && hotel.cheapestPrice <= maxPriceNumber
            )
            : updatedHotels

        res.status(200).json(filterPriceHotels)
    } catch (err) {
        next(errorMessage(500, "查詢飯店失敗"))
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
