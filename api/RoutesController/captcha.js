import sliderCaptcha from "slider-captcha";
import jwt from "jsonwebtoken";
import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";

export const init = async (req, res, next) => {
  try {
    const { bgImage, sliderImage, x } = await sliderCaptcha();
    const token = jwt.sign({ x }, process.env.JWT, { expiresIn: "5m" });

    sendResponse(res, 200, { bgImage, sliderImage, token }, "拼圖產生成功");
  } catch (err) {
    return next(errorMessage(500, "拼圖產生失敗", err));
  }
};

export const verify = (req, res, next) => {
  const { token, userX } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT);
    const correctX = decoded.x;
    const isPassed = Math.abs(userX - correctX) < 6;

    if (!isPassed) {
      return next(errorMessage(400, "拼圖驗證未通過"));
    }

    sendResponse(res, 200, { success: true }, "拼圖驗證通過");
  } catch (err) {
    return next(errorMessage(403, "拼圖驗證失敗", err));
  }
};
