import mongoose from "mongoose";

const HotelFlashSaleSchema = new mongoose.Schema({
  title: { type: String, required: true },                // 活動名稱
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  discountRate: { type: Number, default: 1.0 },            // 折扣率
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  quantityLimit: { type: Number, default: 0 },             // 活動限量總數
  soldCount: { type: Number, default: 0 },                 // 已售數
  bannerUrl: { type: String, default: "" },                // Banner 
  description: { type: String, default: "" },              // 活動說明
  isActive: { type: Boolean, default: true },              // 是否啟用
}, { timestamps: true });

export default mongoose.model("HotelFlashSale", HotelFlashSaleSchema);
