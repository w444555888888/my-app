import mongoose from 'mongoose'
const UserSchma = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: true,
    },
    address: {
        type: String,
        required: false,
    },
    phoneNumber: {
        type: String,
        required: false,
    },
    realName: {
        type: String,
        required: false,
    },
    resetPasswordToken: {  //忘記密碼重置令牌
        type: String,
    },
    resetPasswordExpires: { //忘記密碼重置令牌
        type: Date,
    },
}, { timestamps: true })
export default mongoose.model("User", UserSchma)