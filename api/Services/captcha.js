import jwt from "jsonwebtoken";

/**
 * 初始化滑塊驗證
 * 回傳 token 與 targetX
 */
export const initCaptchaService = () => {
  const x = Math.floor(Math.random() * 80 + 100);
  const token = jwt.sign({ x }, process.env.JWT, { expiresIn: "5m" });
  return { token, targetX: x };
};

/**
 * 驗證滑塊
 */
export const verifyCaptchaService = (token, userX) => {
  const decoded = jwt.verify(token, process.env.JWT);
  const correctX = decoded.x;
  const tolerance = 6; // 允許誤差範圍
  const isPassed = Math.abs(userX - correctX) < tolerance;
  return isPassed;
};
