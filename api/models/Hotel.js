/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-11-03 13:21:05
 * @FilePath: \my-app\api\models\Hotel.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import mongoose from 'mongoose'
const HotelSchema = new mongoose.Schema({
    name: {
        type: String, // 住宿名稱
        required: true,
    },
    type: {
        type: String, // 住宿型態，飯店、公寓、民宿等
        required: true,
    },
    city: {
        type: String, // 城市名稱
        required: true,
    },
    address: {
        type: String, // 住宿地址
        required: true,
    },
    distance: {
        type: String, // 到市中心或其他地標的距離 (可選)
    },
    photos: {
        type: [String], // 住宿照片列表
        required: true,
    },
    title: {
        type: String, // 飯店標題
        required: true,
    },
    desc: {
        type: String, // 飯店詳細描述
        required: true,
    },
    rating: {
        type: Number, // 住宿評分，範圍0-10
        min: 0,
        max: 10,
    },
    cheapestPrice: {
        type: Number, // 最便宜房型價格
        required: true,
    },
    popularHotel: {
        type: Boolean, // 是否為熱門住宿
        default: false,
    },
    comments: {
        type: Number, // 評論數量
        default: 0,
    },
    facilities: {
        wifi: { type: Boolean, default: false }, // 是否有wifi
        parking: { type: Boolean, default: false }, // 是否有停車場
        pool: { type: Boolean, default: false }, // 是否有游泳池
        gym: { type: Boolean, default: false }, // 是否有健身房
        spa: { type: Boolean, default: false }, // 是否有SPA
        restaurant: { type: Boolean, default: false }, // 是否有餐廳
        bar: { type: Boolean, default: false }, // 是否有酒吧
    },
    checkInTime: {
        type: String, // 住宿登記時間
        required: true,
    },
    checkOutTime: {
        type: String, // 住宿退房時間
        required: true,
    },
    coordinates: {
        latitude: { type: Number, required: true }, // 緯度
        longitude: { type: Number, required: true }, // 經度
    },
    email: {
        type: String, // 聯絡郵箱
        required: true,
    },
    nearbyAttractions: {
        type: [String], // 附近景點列表
        required: true,
    },
    phone: {
        type: String, // 聯絡電話
        required: true,
    },
});

HotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotelId',
  justOne: false
})

HotelSchema.set('toObject', { virtuals: true })
HotelSchema.set('toJSON', { virtuals: true })


export default mongoose.model("Hotel", HotelSchema)
