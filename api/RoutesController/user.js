import {
  updateUserService,
  deleteUserService,
  getUserService,
  getAllUsersService
} from "../Services/user.js";
import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";

// 更新使用者資訊
export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await updateUserService(req.user, req.params.id, req.body);
    sendResponse(res, 200, updatedUser);
  } catch (err) {
    next(err);
  }
};

// 刪除使用者與相關資料
export const deletedUser = async (req, res, next) => {
  try {
    await deleteUserService(req.user, req.params.id);
    sendResponse(res, 200, null, { message: "使用者與所有相關資料已成功刪除" });
  } catch (err) {
    next(err);
  }
};

// 取得單一使用者與其訂單
export const getUser = async (req, res, next) => {
  try {
    const userData = await getUserService(req.user, req.params.id);
    sendResponse(res, 200, userData);
  } catch (err) {
    next(err);
  }
};

// 取得全部使用者（限管理員）
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService(req.user);
    sendResponse(res, 200, users);
  } catch (err) {
    next(err);
  }
};
