import jwt from "jsonwebtoken";
import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";


export const initCaptcha = (req, res, next) => {
  try {
    const x = Math.floor(Math.random() * 80 + 100);
    const token = jwt.sign({ x }, process.env.JWT, { expiresIn: "5m" });

    sendResponse(res, 200, {  token, targetX: x }, "滑塊驗證初始化");
  } catch (err) {
    return next(errorMessage(500, "滑塊初始化失敗", err));
  }
};


export const verifyCaptcha = (req, res, next) => {
  const { token, userX } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT);
    const correctX = decoded.x;
    const isPassed = Math.abs(userX - correctX) < 6;

    if (!isPassed) {
      return next(errorMessage(400, "滑塊驗證未通過"));
    }

    sendResponse(res, 200, { success: true }, "滑塊驗證成功");
  } catch (err) {
    return next(errorMessage(403, "Token 驗證失敗", err));
  }
};