import mongoose from "mongoose"
import express from "express"
import dotenv from "dotenv"
import http from "http";

import hotelsApiRoute from "./ApiRoutes/hotels.js"
import roomsApiRoute from "./ApiRoutes/rooms.js"
import usersApiRoute from "./ApiRoutes/users.js"
import authApiRoute from "./ApiRoutes/auth.js"
import orderApiRoute from "./ApiRoutes/order.js"
import flightApiRoute from "./ApiRoutes/flight.js"
import captchaApiRoute from "./ApiRoutes/captcha.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { initWebSocket } from "./websocket/index.js";

dotenv.config() //加載環境變數

const app = express();
const server = http.createServer(app);

initWebSocket(server);

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB, {
            serverSelectionTimeoutMS: 5000,
            retryWrites: true,
            maxPoolSize: 10
        }); 
        console.log("Connected to mongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        // 重試連接
        setTimeout(connect, 5000);
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
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const corsOptions = {
    origin: function (origin, callback) {
        // 如果 origin 為 undefined（例如 Postman 或直接伺服器呼叫）也允許
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
app.use(cors(corsOptions))


///middlewares中間代理商
app.use("/api/v1/hotels", hotelsApiRoute)
app.use("/api/v1/rooms", roomsApiRoute)
app.use("/api/v1/users", usersApiRoute)
app.use("/api/v1/auth", authApiRoute)
app.use("/api/v1/order", orderApiRoute)
app.use("/api/v1/flight", flightApiRoute)
app.use("/api/v1/captcha", captchaApiRoute)


//共同管理error狀態
app.use((error, req, res, next) => {
    const errorStatus = error.status || 500
    const errorMessage = error.message || "伺服器錯誤"

    //return回去讓他可以被next(error) catch
    return res.status(errorStatus).json({
        status: errorStatus,
        message: errorMessage,
        success: false,
        data: null
    })
})
