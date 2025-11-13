import mongoose from "mongoose";

const HotelFlashSaleInventorySchema = new mongoose.Schema({
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: "HotelFlashSale", required: true },
  date: { type: String, required: true },       // yyyy-MM-dd
  totalRooms: { type: Number, required: true },
  bookedRooms: { type: Number, default: 0 },
}, { timestamps: true });

HotelFlashSaleInventorySchema.index({ saleId: 1, date: 1 }, { unique: true });

export default mongoose.model("HotelFlashSaleInventory", HotelFlashSaleInventorySchema);
