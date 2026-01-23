import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";
import {
  registerUser,
  loginUser,
  forgotUserPassword,
  resetUserPassword,
  verifyUserToken,
  getCurrentUser,
} from "../Services/auth.js";

// 註冊
export const register = async (req, res, next) => {
  try {
    const savedUser = await registerUser(req.body);
    sendResponse(res, 200, savedUser);
  } catch (err) {
    next(errorMessage(400, err.message, err));
  }
};

// 登入
export const login = async (req, res, next) => {
  try {
    const { token, userDetails } = await loginUser(req.body);
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("JWT_token", token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, 200, { userDetails });
  } catch (err) {
    next(errorMessage(404, err.message, err));
  }
};

// 忘記密碼
export const forgotPassword = async (req, res, next) => {
  try {
    const result = await forgotUserPassword(req.body.email);
    sendResponse(res, 200, null, result);
  } catch (err) {
    next(errorMessage(404, err.message, err));
  }
};

// 重置密碼
export const resetPassword = async (req, res, next) => {
  try {
    const result = await resetUserPassword(req.params.token, req.body.password);
    sendResponse(res, 200, null, result);
  } catch (err) {
    next(errorMessage(404, err.message, err));
  }
};

// 驗證 token middleware
export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.JWT_token;
    const user = verifyUserToken(token);
    req.user = user;
    next();
  } catch (err) {
    next(errorMessage(403, err.message));
  }
};

// 取得當前使用者
export const me = (req, res, next) => {
  try {
    const user = getCurrentUser(req.user);
    sendResponse(res, 200, user);
  } catch (err) {
    next(errorMessage(500, err.message, err));
  }
};

// 登出
export const logout = (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("JWT_token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/",
    });
    sendResponse(res, 200, null, { message: "已登出" });
  } catch (err) {
    next(errorMessage(500, err.message, err));
  }
};
