import Subscribe from "../models/Subscribe.js";
import { sendMail } from "../utils/mailer.js";
import { sendResponse } from "../sendResponse.js";
import { errorMessage } from "../errorMessage.js";


// 新增 Email 訂閱
export const addSubscribe = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(errorMessage(400, "Email 不得為空"));
        }

        const exist = await Subscribe.findOne({ email });
        if (exist) {
            return sendResponse(res, 200, null, "Email 已訂閱過囉！");
        }

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

        sendResponse(res, 200, null, "訂閱成功！");

    } catch (error) {
        return next(errorMessage(500, "Email訂閱發生錯誤", error));
    }
};



// 取得全部訂閱（給後台用）
export const getAllSubscribe = async (req, res, next) => {
    try {
        const list = await Subscribe.find().sort({ createdAt: -1 });
        sendResponse(res, 200, list);
    } catch (error) {
        return next(errorMessage(500, "訂閱資料查詢失敗", error));
    }
};
