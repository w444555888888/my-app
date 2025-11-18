import express from "express";
import { addSubscribe, getAllSubscribe, deleteSubscribe } from "../RoutesController/subscribe.js";

const router = express.Router();

// 新增訂閱
router.post("/", addSubscribe);

// 查詢訂閱列表（後台用）
router.get("/", getAllSubscribe);

// 刪除訂閱（後台用）
router.delete("/:id", deleteSubscribe);

export default router;
