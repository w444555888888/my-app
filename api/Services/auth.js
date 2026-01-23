import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendMail } from "../utils/mailer.js";

/**
 * 註冊使用者
 */
export const registerUser = async (registerData) => {
  const existingUser =
    (await User.findOne({ username: registerData.username })) ||
    (await User.findOne({ email: registerData.email }));

  if (existingUser) throw new Error("此帳號或信箱已被註冊");

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(registerData.password, salt);

  const newUser = new User({
    username: registerData.username,
    email: registerData.email,
    password: hash,
  });

  return await newUser.save();
};

/**
 * 登入使用者
 */
export const loginUser = async (loginData) => {
  const user =
    (await User.findOne({ username: loginData.account })) ||
    (await User.findOne({ email: loginData.account }));

  if (!user) throw new Error("沒有此使用者");

  const isPasswordCorrect = await bcrypt.compare(loginData.password, user.password);
  if (!isPasswordCorrect) throw new Error("輸入密碼錯誤");

  if (!process.env.JWT) throw new Error("JWT 未定義");

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT,
    { expiresIn: "7d" }
  );

  const { password, ...userDetails } = user._doc;
  return { token, userDetails };
};

/**
 * 忘記密碼
 */
export const forgotUserPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("沒有此信箱的使用者");

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 小時
  await user.save();

  await sendMail({
    to: email,
    subject: "重置密碼請求",
    text: `請點擊以下鏈接重置你的密碼：\nhttp://localhost:3000/reset-password/${token}\n如果你沒有請求此操作，請忽略此郵件。`,
  });

  return { message: "重置密碼郵件已發送" };
};

/**
 * 重置密碼
 */
export const resetUserPassword = async (token, password) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("重置令牌無效或已過期");

  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: "密碼重置成功" };
};

/**
 * 驗證 JWT token
 */
export const verifyUserToken = (token) => {
  if (!token) throw new Error("請先登入");
  try {
    return jwt.verify(token, process.env.JWT);
  } catch (err) {
    throw new Error("登入已過期，請重新登入");
  }
};

/**
 * 取得當前使用者
 */
export const getCurrentUser = (user) => {
  if (!user) throw new Error("使用者未登入");
  return user;
};
