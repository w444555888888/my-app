import express from "express"
import { deletedUser, getAllUsers, getUser, updateUser } from "../RoutesController/user.js"
import { verifyToken } from "../RoutesController/auth.js";

const router = express.Router()
//更新user
router.put("/:id", verifyToken, updateUser)
//刪除
router.delete("/:id", verifyToken, deletedUser)
//讀取 單一用戶資料
router.get("/:id", verifyToken, getUser)
//讀取全部用戶資料
router.get("/", verifyToken, getAllUsers)

export default router