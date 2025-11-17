import cron from "node-cron";
import Subscribe from "../models/Subscribe.js";
import { sendMail } from "./mailer.js";


// 定時任務
export const startNewsletterJob = () => {
    console.log('啟動定時任務每天早上 9 點發送電子報');

    // 秒 分 時 日 月 週
    cron.schedule("0 0 9 * * *", async () => {
        try {
            const subscribers = await Subscribe.find();
            if (subscribers.length === 0) {
                console.log("無訂閱者，不寄送");
                return;
            }
            for (const sub of subscribers) {
                await sendMail({
                    to: sub.email,
                    subject: "今日最新優惠 - MIKE Booking",
                    html: `
                        <h2>今日最新優惠</h2>
                        <p>感謝您訂閱，我們將定期提供最優惠的旅遊資訊</p>
                        <p style="font-size:12px;color:#888;">若您不想再收到此郵件，可以回覆告知。</p>
                    `
                });
            }

            console.log("今日電子報發送完成");
        } catch (err) {
            console.error("電子報寄送失敗：", err);
        }
    });
};
