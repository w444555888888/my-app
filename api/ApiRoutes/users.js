import express from "express"
import { deletedUser, getAllUsers, getUser, updateUser } from "../RoutesController/user.js"

const router = express.Router()
//更新user
router.put("/:id", updateUser)
//刪除
router.delete("/:id", deletedUser)
//讀取 單一用戶資料
router.get("/:id", getUser)
//讀取全部用戶資料
router.get("/", getAllUsers)

export default router