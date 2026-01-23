import {
  getHotelNameSuggestionsService,
  getAllHotelsService,
  getPopularHotelsService,
  getSearchHotelsService,
  createHotelService,
  getHotelService,
  updatedHotelService,
  deleteHotelService
} from "../Services/hotels.js";
import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";

// 模糊搜尋飯店名稱
export const getHotelNameSuggestions = async (req, res, next) => {
  try {
    const data = await getHotelNameSuggestionsService(req.query);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 獲取所有飯店資料
export const getAllHotels = async (req, res, next) => {
  try {
    const data = await getAllHotelsService();
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 獲取熱門飯店
export const getPopularHotels = async (req, res, next) => {
  try {
    const data = await getPopularHotelsService();
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 搜尋飯店資料
export const getSearchHotels = async (req, res, next) => {
  try {
    const data = await getSearchHotelsService(req.query);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 新增飯店
export const createHotel = async (req, res, next) => {
  try {
    const data = await createHotelService(req.body);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 取得單一飯店資料
export const getHotel = async (req, res, next) => {
  try {
    const data = await getHotelService(req.params.id);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 更新飯店
export const updatedHotel = async (req, res, next) => {
  try {
    const data = await updatedHotelService(req.params.id, req.body);
    sendResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// 刪除飯店
export const deleteHotel = async (req, res, next) => {
  try {
    const data = await deleteHotelService(req.params.id);
    sendResponse(res, 200, null, { message: "刪除資料成功" });
  } catch (err) {
    next(err);
  }
};
