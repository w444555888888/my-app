import Subscribe from "../models/Subscribe.js";
import { sendMail } from "../utils/mailer.js";
import { errorMessage } from "../errorMessage.js";

// 新增訂閱（含寄信）
export const addSubscribeService = async (email) => {
  if (!email) throw errorMessage(400, "Email 不得為空");

  const exist = await Subscribe.findOne({ email });
  if (exist) throw errorMessage(200, "Email 已訂閱過囉！");

  const newSub = new Subscribe({ email });
  await newSub.save();

  // 訂閱成功後立即寄信
  await sendMail({
    to: email,
    subject: "感謝你的訂閱！",
    html: `
      <h2>歡迎加入我們MIKE.BOOKING的電子報</h2>
      <p>感謝您訂閱，我們會定期寄送MIKE.BOOKING最新消息給您。</p>
      <p style="color:#999;font-size:12px;">如果你不是本人訂閱，請忽略此信。</p>
    `
  });
};

// 取得全部訂閱
export const getAllSubscribeService = async () => {
  return Subscribe.find().sort({ createdAt: -1 });
};

// 刪除訂閱
export const deleteSubscribeService = async (id) => {
  const exist = await Subscribe.findById(id);
  if (!exist) throw errorMessage(404, "找不到此訂閱紀錄");

  await Subscribe.findByIdAndDelete(id);
};
