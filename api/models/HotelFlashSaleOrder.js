import mongoose from "mongoose";

const HotelFlashSaleOrderSchema = new mongoose.Schema(
    {
        saleId: { type: mongoose.Schema.Types.ObjectId, ref: "HotelFlashSale", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
        date: { type: String, required: true }, // 預訂日期（對應 HotelFlashSaleInventory.date）
        discountRate: { type: Number, default: 0 }, // 折扣率
        basePrice: { type: Number },            // 原價
        finalPrice: { type: Number },               // 折扣後價格
        status: {
            type: String,
            enum: ["booked", "cancelled"],
            default: "booked"
        }// 訂單狀態
    },
    { timestamps: true }
);

export default mongoose.model("HotelFlashSaleOrder", HotelFlashSaleOrderSchema);
