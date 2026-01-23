import {
  addSubscribeService,
  getAllSubscribeService,
  deleteSubscribeService
} from "../Services/subscribe.js";

import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";

// 新增 Email 訂閱
export const addSubscribe = async (req, res, next) => {
  try {
    await addSubscribeService(req.body.email);
    sendResponse(res, 200, null, "訂閱成功！");
  } catch (err) {
    next(err);
  }
};

// 取得全部訂閱
export const getAllSubscribe = async (req, res, next) => {
  try {
    const list = await getAllSubscribeService();
    sendResponse(res, 200, list);
  } catch (err) {
    next(err);
  }
};

// 刪除訂閱
export const deleteSubscribe = async (req, res, next) => {
  try {
    await deleteSubscribeService(req.params.id);
    sendResponse(res, 200, null, "訂閱已成功刪除");
  } catch (err) {
    next(err);
  }
};
