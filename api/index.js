import mongoose from "mongoose"
//ES6後import 與export 取代了原本舊版的require(是node舊版CommonJS)
import express from "express"
import dotenv from "dotenv"
import hotelsApiRoute from "./ApiRoutes/hotels.js"
import roomsApiRoute from "./ApiRoutes/rooms.js"
import usersApiRoute from "./ApiRoutes/users.js"
import authApiRoute from "./ApiRoutes/auth.js"
import orderApiRoute from "./ApiRoutes/order.js"
import flightApiRoute from "./ApiRoutes/flight.js"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()
dotenv.config() //加載環境變數

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB)
        console.log("Connected to mongoDB")
    } catch (error) {
        console.log("disconnected to mongoDB")
    }
}

mongoose.connection.on("connected", () => {
    console.log("MongoDB connected!")
})
mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected!")
})

const port = 5000
app.listen(port, () => {
    connect()
    console.log(`connected to ${port} backend 成功連線`)
    //並要像npm start 一樣啟動它，
})

app.use(express.json())//讓上傳的req.body可以視為json
app.use(cookieParser())//cookie驗證

//跨域
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, // 允許發送Cookie
};
app.use(cors(corsOptions))


///middlewares中間代理商
app.use("/api/v1/hotels", hotelsApiRoute)
app.use("/api/v1/rooms", roomsApiRoute)
app.use("/api/v1/users", usersApiRoute)
app.use("/api/v1/auth", authApiRoute)
app.use("/api/v1/order", orderApiRoute)
app.use("/api/v1/flight", flightApiRoute)


//共同管理error狀態
app.use((error, req, res, next) => {
    const errorStatus = error.status || 500
    const errorMessage = error.message || "伺服器錯誤"

    //return回去讓他可以被next(error) catch
    return res.status(errorStatus).json({
        status: errorStatus,
        message: errorMessage,
        success: errorStatus === 200 || errorStatus === 201,
        data: errorStatus === 200 || errorStatus === 201 ? {} : null
    })
})
