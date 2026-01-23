import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";
import { initCaptchaService, verifyCaptchaService } from "../Services/captcha.js";

// 初始化滑塊
export const initCaptcha = (req, res, next) => {
  try {
    const result = initCaptchaService();
    sendResponse(res, 200, result, "滑塊驗證初始化");
  } catch (err) {
    return next(errorMessage(500, "滑塊初始化失敗", err));
  }
};

// 驗證滑塊
export const verifyCaptcha = (req, res, next) => {
  const { token, userX } = req.body;
  try {
    const isPassed = verifyCaptchaService(token, userX);

    if (!isPassed) return next(errorMessage(400, "滑塊驗證未通過"));

    sendResponse(res, 200, { success: true }, "滑塊驗證成功");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(errorMessage(401, "驗證失敗：Token 已過期"));
    } else if (err.name === "JsonWebTokenError") {
      return next(errorMessage(401, "驗證失敗：無效的 Token"));
    }
    return next(errorMessage(403, "Token 驗證失敗", err));
  }
};
