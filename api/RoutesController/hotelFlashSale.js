import {
  listHotelFlashSalesService,
  getHotelFlashSaleByIdService,
  createHotelFlashSaleService,
  updateHotelFlashSaleService,
  deleteHotelFlashSaleService,
  listFlashSaleInventoryService,
  updateFlashSaleInventoryService,
  uploadHotelFlashSaleBannerService,
  bookHotelFlashSaleService,
  getAllHotelFlashSaleOrderService
} from "../Services/hotelFlashSale.js";
import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";

// 限時搶購活動
export const listHotelFlashSales = async (req, res, next) => {
  try {
    const data = await listHotelFlashSalesService(req.query);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

export const getHotelFlashSaleById = async (req, res, next) => {
  try {
    const data = await getHotelFlashSaleByIdService(req.params.id);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

export const createHotelFlashSale = async (req, res, next) => {
  try {
    const data = await createHotelFlashSaleService(req.body);
    sendResponse(res, 201, data);
  } catch (err) {
    next(err);
  }
};

export const updateHotelFlashSale = async (req, res, next) => {
  try {
    const data = await updateHotelFlashSaleService(req.params.id, req.body);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

export const deleteHotelFlashSale = async (req, res, next) => {
  try {
    const data = await deleteHotelFlashSaleService(req.params.id);
    sendResponse(res, 200, null, { message: "刪除成功（含活動庫存與圖片）" });
  } catch (err) {
    next(err);
  }
};

// 活動庫存
export const listFlashSaleInventory = async (req, res, next) => {
  try {
    const data = await listFlashSaleInventoryService(req.params.saleId);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

export const updateFlashSaleInventory = async (req, res, next) => {
  try {
    const data = await updateFlashSaleInventoryService(req.body);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// Banner
export const uploadHotelFlashSaleBanner = uploadHotelFlashSaleBannerService;

// 搶購訂單
export const bookHotelFlashSale = async (req, res, next) => {
  try {
    const data = await bookHotelFlashSaleService(req.body);
    sendResponse(res, 200, data, { message: "搶購成功" });
  } catch (err) {
    next(err);
  }
};

// 後台查所有訂單
export const getAllHotelFlashSaleOrder = async (req, res, next) => {
  try {
    const data = await getAllHotelFlashSaleOrderService();
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};
