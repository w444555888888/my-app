import express from "express";
import {
  listHotelFlashSales,
  getHotelFlashSaleById,
  createHotelFlashSale,
  updateHotelFlashSale,
  deleteHotelFlashSale,
  listFlashSaleInventory,
  updateFlashSaleInventory,
  uploadHotelFlashSaleBanner
} from "../RoutesController/hotelFlashSale.js";

const router = express.Router();

router.get("/", listHotelFlashSales);
router.post("/", createHotelFlashSale);

router.get("/inventory/:saleId", listFlashSaleInventory);
router.put("/inventory", updateFlashSaleInventory);

// banner圖片上傳
router.post("/upload-banner", uploadHotelFlashSaleBanner);

router.get("/:id", getHotelFlashSaleById);
router.put("/:id", updateHotelFlashSale);
router.delete("/:id", deleteHotelFlashSale);
export default router;
