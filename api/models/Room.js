/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-25 13:15:20
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-11-03 10:42:19
 * @FilePath: \my-app\api\models\Room.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import mongoose from 'mongoose'
const RoomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: [String],
        required: true,
    },
    bedNumber: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    maxPeople: {
        type: Number,
        required: true,
    },
    breakFast: {
        type: Boolean,
        required: true,
    },
    hotelId: {  //對應hotels的id
        type: String,
        required: true,
    },
    bookingPolicies: [
        {
            type: { type: String, required: true }, // 政策類型，如 "退款政策"、"付款方式"
            description: { type: String, required: true }, // 政策詳細描述
            refundable: { type: Boolean, default: false }, // 是否可退款
            paymentMethod: { type: String, default: null } // 付款方式，如 "Booking.com"
        }
    ]

}, { timestamps: true })
export default mongoose.model("Room", RoomSchema)

