/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-25 23:42:11
 * @FilePath: \my-app\api\RoutesController\hotels.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Hotel from "../models/Hotel.js"


// 获取所有酒店数据
export const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find() // 从数据库中获取所有酒店记录
        res.status(200).json(hotels)
    } catch (err) {
        res.status(500).json({ message: err.message })
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
    next()
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
