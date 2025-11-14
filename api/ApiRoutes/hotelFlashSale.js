import express from "express";
import {
  listHotelFlashSales,
  getHotelFlashSaleById,
  createHotelFlashSale,
  updateHotelFlashSale,
  deleteHotelFlashSale,
  listFlashSaleInventory,
  updateFlashSaleInventory,
  uploadHotelFlashSaleBanner,
  bookHotelFlashSale
} from "../RoutesController/hotelFlashSale.js";

const router = express.Router();

router.get("/", listHotelFlashSales);
router.post("/", createHotelFlashSale);

router.get("/inventory/:saleId", listFlashSaleInventory);
router.put("/inventory", updateFlashSaleInventory);
// banner圖片上傳
router.post("/upload-banner", uploadHotelFlashSaleBanner);
// 搶購飯店訂單
router.post("/book", bookHotelFlashSale);

router.get("/:id", getHotelFlashSaleById);
router.put("/:id", updateHotelFlashSale);
router.delete("/:id", deleteHotelFlashSale);
export default router;
