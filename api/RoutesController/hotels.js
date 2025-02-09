/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-02-09 22:53:02
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
            let cheapestPrice = Infinity
            let totalHotelPrice = 0

            hotelRooms.forEach(room => {
                let roomTotalPrice = 0
                let dayCount = 0

                // 處理日期範圍
                const start = parseISO(startDate)
                const end = parseISO(endDate)
                console.log(room.holidays, '2222')

                // 逐日計算價格
                for (let d = start; isSameDay(d, end) || d < end; d = addDays(d, 1)) {
                    dayCount++
                    const dayOfWeek = d.getDay()
                    const dateString = format(d, 'yyyy-MM-dd')
                    let dailyPrice = null


                    // 檢查是否為假日價格
                    room.holidays?.forEach(holiday => {
                        if (holiday.date === dateString) {
                            dailyPrice = holiday.price
                        }
                    })

                    // 若非假日，則按照星期價格計算
                    if (dailyPrice === null) {
                        room.pricing?.forEach(priceOption => {
                            if (priceOption.days_of_week?.includes(dayOfWeek)) {
                                dailyPrice = priceOption.price
                            }
                        })
                    }

                    if (dailyPrice !== null) {
                        roomTotalPrice += dailyPrice
                    }
                }

                totalHotelPrice += roomTotalPrice
                const averageRoomPrice = dayCount > 0 ? roomTotalPrice / dayCount : Infinity
                cheapestPrice = Math.min(cheapestPrice, averageRoomPrice)
            })

            return {
                ...hotel._doc,
                availableRooms: hotelRooms,
                totalPrice: totalHotelPrice,
                cheapestPrice: cheapestPrice === Infinity ? null : cheapestPrice
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
