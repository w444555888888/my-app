import mongoose from "mongoose";
import HotelFlashSale from "../models/HotelFlashSale.js";
import HotelFlashSaleInventory from "../models/HotelFlashSaleInventory.js";
import HotelFlashSaleOrder from "../models/HotelFlashSaleOrder.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { errorMessage } from "../errorMessage.js";
import dayjs from "dayjs";
import multer from "multer";
import path from "path";
import fs from "fs";

/** 活動查詢 */
export const listHotelFlashSalesService = async (query) => {
  const { activeOnly } = query;
  const now = new Date();
  const q = activeOnly
    ? { isActive: true, startTime: { $lte: now }, endTime: { $gte: now } }
    : {};

  return HotelFlashSale.find(q)
    .populate("hotelId")
    .populate("roomId")
    .sort({ startTime: 1 });
};

/** 取得單筆活動 */
export const getHotelFlashSaleByIdService = async (id) => {
  const sale = await HotelFlashSale.findById(id)
    .populate("hotelId")
    .populate("roomId");
  if (!sale) throw errorMessage(404, "找不到此活動");
  return sale;
};

/** 新增活動（同時生成每日庫存） */
export const createHotelFlashSaleService = async (body) => {
  const { hotelId, roomId, startTime, endTime, quantityLimit, basePrice } = body;
  if (!basePrice) throw errorMessage(400, "請輸入活動底價");

  const hotel = await Hotel.findById(hotelId);
  const room = await Room.findById(roomId);
  if (!hotel || !room) throw errorMessage(404, "飯店或房型不存在");

  const newSale = new HotelFlashSale(body);
  await newSale.save();

  // 生成每日庫存
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const inventories = [];
  for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
    inventories.push({
      saleId: newSale._id,
      date: d.format("YYYY-MM-DD"),
      totalRooms: quantityLimit,
      bookedRooms: 0,
    });
  }
  if (inventories.length) await HotelFlashSaleInventory.insertMany(inventories);

  return newSale;
};

/** 更新活動 */
export const updateHotelFlashSaleService = async (id, body) => {
  const existing = await HotelFlashSale.findById(id);
  if (!existing) throw errorMessage(404, "找不到此活動");

  const blockedFields = ["hotelId", "roomId", "startTime", "endTime", "quantityLimit", "basePrice"];
  blockedFields.forEach(f => delete body[f]);

  return HotelFlashSale.findByIdAndUpdate(id, body, { new: true });
};

/** 刪除活動 */
export const deleteHotelFlashSaleService = async (id) => {
  const deleted = await HotelFlashSale.findByIdAndDelete(id);
  if (!deleted) throw errorMessage(404, "活動不存在");

  await HotelFlashSaleInventory.deleteMany({ saleId: deleted._id });

  if (deleted.bannerUrl) {
    try {
      const imagePath = path.join(process.cwd(), deleted.bannerUrl.startsWith("/") ? deleted.bannerUrl.slice(1) : deleted.bannerUrl);
      if (imagePath.includes(path.join("uploads", "hotelFlashSale")) && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.error("刪除圖片錯誤:", err);
    }
  }
  return deleted;
};

/** 查詢庫存 */
export const listFlashSaleInventoryService = async (saleId) => {
  return HotelFlashSaleInventory.find({ saleId }).sort("date");
};

/** 更新庫存 */
export const updateFlashSaleInventoryService = async ({ saleId, date, totalRooms }) => {
  return HotelFlashSaleInventory.findOneAndUpdate(
    { saleId, date },
    { $set: { totalRooms } },
    { upsert: true, new: true }
  );
};

/** Banner 上傳 */
const uploadDir = "uploads/hotelFlashSale";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage });

export const uploadHotelFlashSaleBannerService = [
  upload.single("banner"),
  async (req, res, next) => {
    try {
      if (!req.file) throw errorMessage(400, "未接收到圖片");
      const { saleId } = req.body;
      const newFileUrl = `/uploads/hotelFlashSale/${req.file.filename}`;

      if (saleId) {
        const sale = await HotelFlashSale.findById(saleId);
        if (sale && sale.bannerUrl) {
          const oldPath = "." + sale.bannerUrl;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      return newFileUrl;
    } catch (err) {
      next(err);
    }
  },
];

/** 搶購訂單 */
export const bookHotelFlashSaleService = async ({ saleId, userId, date }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!saleId || !userId || !date) throw errorMessage(400, "缺少必要參數");

    const sale = await HotelFlashSale.findById(saleId);
    if (!sale) throw errorMessage(404, "活動不存在");
    if (!sale.isActive) throw errorMessage(400, "活動尚未啟用");

    const now = dayjs();
    if (now.isBefore(dayjs(sale.startTime)) || now.isAfter(dayjs(sale.endTime))) {
      throw errorMessage(400, "活動不在有效期間");
    }

    const inventory = await HotelFlashSaleInventory.findOne({ saleId, date }).session(session);
    if (!inventory) throw errorMessage(404, "找不到該日期的活動庫存");
    if (inventory.bookedRooms >= inventory.totalRooms) throw errorMessage(400, "該日期已售罄");

    const existOrder = await HotelFlashSaleOrder.findOne({ saleId, userId, date }).session(session);
    if (existOrder) throw errorMessage(400, "您已搶購過此日期的活動");

    const basePrice = sale.basePrice || 0;
    const discountRate = sale.discountRate ?? 1;
    const finalPrice = Math.round(basePrice * discountRate);

    const updatedInv = await HotelFlashSaleInventory.findOneAndUpdate(
      { saleId, date, bookedRooms: { $lt: inventory.totalRooms } },
      { $inc: { bookedRooms: 1 } },
      { new: true, session }
    );

    if (!updatedInv) throw errorMessage(400, "庫存已售罄或更新失敗");

    const newOrder = new HotelFlashSaleOrder({
      saleId,
      userId,
      hotelId: sale.hotelId,
      roomId: sale.roomId,
      date,
      basePrice,
      discountRate,
      finalPrice,
      status: "booked",
    });

    await newOrder.save({ session });
    await session.commitTransaction();
    return newOrder;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/** 後台查全部訂單 */
export const getAllHotelFlashSaleOrderService = async () => {
  return HotelFlashSaleOrder.find()
    .populate("userId", "username email")
    .populate("hotelId", "name")
    .populate("roomId", "title")
    .populate("saleId", "title basePrice discountRate")
    .sort({ createdAt: -1 });
};
