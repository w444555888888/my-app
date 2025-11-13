import HotelFlashSale from "../models/HotelFlashSale.js";
import HotelFlashSaleInventory from "../models/HotelFlashSaleInventory.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";
import dayjs from "dayjs";
import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * 查詢活動（全部 or 進行中）
 */
export const listHotelFlashSales = async (req, res, next) => {
    try {
        const { activeOnly } = req.query;
        const now = new Date();

        const query = activeOnly
            ? { isActive: true, startTime: { $lte: now }, endTime: { $gte: now } }
            : {};

        const flashSales = await HotelFlashSale.find(query)
            .populate("hotelId")
            .populate("roomId")
            .sort({ startTime: 1 });

        sendResponse(res, 200, flashSales);
    } catch (err) {
        next(errorMessage(500, "查詢限時搶購失敗", err));
    }
};


/**
 * 取得單筆活動資料（編輯使用）
 */
export const getHotelFlashSaleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const sale = await HotelFlashSale.findById(id)
            .populate("hotelId")
            .populate("roomId");

        if (!sale) return next(errorMessage(404, "找不到此活動"));

        sendResponse(res, 200, sale);
    } catch (err) {
        next(errorMessage(500, "查詢單筆活動失敗", err));
    }
};

/**
 * 新增活動
 * 同時可建立對應的每日庫存資料
 */
export const createHotelFlashSale = async (req, res, next) => {
    try {
        const { hotelId, roomId, startTime, endTime, quantityLimit } = req.body;
        const hotel = await Hotel.findById(hotelId);
        const room = await Room.findById(roomId);
        if (!hotel || !room) return next(errorMessage(404, "飯店或房型不存在"));

        const newSale = new HotelFlashSale(req.body);
        await newSale.save();

        // 自動產生每日活動庫存
        const start = dayjs(startTime);
        const end = dayjs(endTime);
        const inventories = [];

        for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
            const dateStr = d.format("YYYY-MM-DD");
            inventories.push({
                saleId: newSale._id,
                date: dateStr,
                totalRooms: quantityLimit,
                bookedRooms: 0,
            });
        }


        if (inventories.length) {
            await HotelFlashSaleInventory.insertMany(inventories);
        }

        sendResponse(res, 201, newSale);
    } catch (err) {
        next(errorMessage(500, "新增限時搶購失敗", err));
    }
};



/**
 * 更新活動資料
 * 邏輯：
 * ----------------------------------------------
 * ✔ 活動建立後，以下欄位一律禁止修改：
 *   - hotelId（飯店）
 *   - roomId（房型）
 *   - startTime（開始時間）
 *   - endTime（結束時間）
 *   - quantityLimit（每日庫存數量）
 *
 * ✔ 原因：這些欄位會影響「每日庫存」的自動生成，
 *   若允許在活動期間修改日期或庫存上限，
 *   會導致：
 *       - 每日庫存重新建立 → 已預訂資料會消失（資料毀損）
 *       - 活動期間錯亂
 *       - 房型/飯店錯置
 *
 * ✔ 因此「編輯模式」僅允許修改：
 *   - title（活動標題）
 *   - description（活動描述）
 *   - discountRate（折扣）
 *   - isActive（上下架）
 *   - bannerUrl（圖片）
 *
 * ✔ 每日庫存因為是獨立管理（/inventory API），
 *   不應跟主活動一起更新。
 *
 * ----------------------------------------------
 */
export const updateHotelFlashSale = async (req, res, next) => {
    try {
        const saleId = req.params.id;

        const existing = await HotelFlashSale.findById(saleId);

        if (!existing) return next(errorMessage(404, "找不到此活動"));

        const blockedFields = [
            "hotelId",
            "roomId",
            "startTime",
            "endTime",
            "quantityLimit"
        ];
        blockedFields.forEach(field => delete req.body[field]);

        const updated = await HotelFlashSale.findByIdAndUpdate(
            saleId,
            req.body,
            { new: true }
        );

        //因為前端已經禁止修改 start/end/quantity，所以這裡不需要重建庫存
        sendResponse(res, 200, updated);

    } catch (err) {
        next(errorMessage(500, "更新限時搶購失敗", err));
    }
};



/**
 * 刪除活動（連同活動庫存）
 */
export const deleteHotelFlashSale = async (req, res, next) => {
    try {
        const deleted = await HotelFlashSale.findByIdAndDelete(req.params.id);
        if (!deleted) return next(errorMessage(404, "活動不存在"));

        await HotelFlashSaleInventory.deleteMany({ saleId: deleted._id });

        sendResponse(res, 200, null, { message: "刪除成功（含活動庫存）" });
    } catch (err) {
        next(errorMessage(500, "刪除限時搶購失敗", err));
    }
};



/**
 * 查詢活動庫存列表
 */
export const listFlashSaleInventory = async (req, res, next) => {
    try {
        const { saleId } = req.params;
        const inventories = await HotelFlashSaleInventory.find({ saleId }).sort("date");
        sendResponse(res, 200, inventories);
    } catch (err) {
        next(errorMessage(500, "查詢活動庫存失敗", err));
    }
};



/**
 * 更新單日活動庫存
 */
export const updateFlashSaleInventory = async (req, res, next) => {
    try {
        const { saleId, date, totalRooms } = req.body;
        const updated = await HotelFlashSaleInventory.findOneAndUpdate(
            { saleId, date },
            { $set: { totalRooms } },
            { upsert: true, new: true }
        );
        sendResponse(res, 200, updated);
    } catch (err) {
        next(errorMessage(500, "更新活動庫存失敗", err));
    }
};



/**
 * 上傳活動圖片（banner）
 */
const uploadDir = "uploads/hotelFlashSale";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

export const uploadHotelFlashSaleBanner = [
    upload.single("banner"),
    async (req, res, next) => {
        try {
            if (!req.file) return next(errorMessage(400, "未接收到圖片"));
  console.log("收到上傳 saleId =", req.body.saleId);
            console.log("收到檔案 =", req.file?.filename);
            const { saleId } = req.body; 
            const newFileUrl = `/uploads/hotelFlashSale/${req.file.filename}`;

            //  刪除舊圖
            if (saleId) {
                const sale = await HotelFlashSale.findById(saleId);
                if (sale && sale.bannerUrl) {
                    const oldPath = "." + sale.bannerUrl;
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            }

            sendResponse(res, 200, { bannerUrl: newFileUrl });

        } catch (err) {
            next(errorMessage(500, "上傳活動圖片失敗", err));
        }
    },
];

