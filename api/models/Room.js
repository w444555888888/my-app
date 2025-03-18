/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-02-09 22:58:15
 * @FilePath: \my-app\api\models\Room.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import mongoose from 'mongoose'
const RoomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true, // 房間標題
    },
    desc: {
        type: [String],
        required: true, // 房間設施清單
    },
    bedNumber: {
        type: String,
        required: true, // 床型描述
    },
    maxPeople: {
        type: Number,
        required: true, // 最大入住人數
    },
    breakFast: {
        type: Boolean,
        required: true, // 是否提供早餐
    },
    hotelId: {
        type: String,
        required: true, // 對應的飯店 ID
    },
    paymentOptions: [
        {
            type: {
                type: String,
                required: true, //付款類型
            },
            description: {
                type: String,
                required: true, // 付款詳細描述
            },
            refundable: {
                type: Boolean,
                default: false, // 是否可退款
            },
            paymentMethod: {
                type: String,
                default: null, // 付款方式分類
            }
        }
    ],
    pricing: [
        {
            days_of_week: {
                type: [Number], // 星期幾的價格
                required: true,
            },
            price: {
                type: Number, // 價格
                required: true,
            },
        }
    ],
    holidays: [
        {
            date: {
                type: String, // 節假日日期
                required: true,
            },
            price: {
                type: Number, // 節假日價格
                required: true,
            },
        }
    ],
}, { timestamps: true })
export default mongoose.model("Room", RoomSchema)

