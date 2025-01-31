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
        type: String,//住宿名稱
        required: true,
    },
    type: {
        type: String,//住宿型態，到時候會有飯店、公寓、民宿等等的
        required: true,
    },
    city: {
        type: String,//同於地址的城市
        required: true,
    },
    address: {
        type: String,//在城市住址
        required: true,
    },
    distance: {
        type: String,//這欄可寫可不寫是模擬到市中心的距離

    },
    photos: {
        type: [String],//因為會有多張住宿照片所以使用array
        required: true,
    },
    title: {//飯店的標題
        type: String,
        required: true,
    },
    desc: {//飯店的詳細描述
        type: String,
        required: true,
    },
    rating: {
        type: Number,//可以打分0~10
        min: 0,
        max: 10,
    },
    cheapestPrice: {
        type: Number,
        required: true,  //這邊搜尋後希望是通常都會展示最便宜的那個房型價格
    },
    popularHotel: {
        type: Boolean, //最熱門住宿
        default: false,
    },
    comments: {
        type: Number,
        default: 0,
    }
})
export default mongoose.model("Hotel", HotelSchema)
