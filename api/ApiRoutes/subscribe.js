import express from "express";
import { addSubscribe, getAllSubscribe } from "../RoutesController/subscribe.js";

const router = express.Router();

// 新增訂閱
router.post("/", addSubscribe);

// 查詢訂閱列表（後台用）
router.get("/", getAllSubscribe);

export default router;
