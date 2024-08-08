/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-08-04 17:27:55
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-08 15:10:43
 * @FilePath: \my-app\api\JWT_Token.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import jwt from "jsonwebtoken"
import { errorMessage } from "./errorMessage.js"

const JWT_Token = (req, res, next, callBackFunction) => {
  // 使用app.use(cookieParser()) 取得cookie
  const token = req.cookies.JWT_token
  if (!token) { next(errorMessage(401, "請先登入")) }

  //cookie解碼
  jwt.verify(token, process.env.JWT, (err, payload) => {
    if (err) { next(errorMessage(403, "TOKEN無效，解開JWT失敗")) }
    // token解開的對應id資料
    req.userData = payload
    // 回調函數
    callBackFunction()
  })
}
export const verifyUser = (req, res, next) => {
  JWT_Token(
    req, res, next, () => {
      // 請求的id
      const requestId = req.params.id
      // token的id == 請求的id
      if (req.userData.id == requestId) {
        next()
      } else {
        next(errorMessage(403, "只能修改個人自己的權限"))
      }
    }
  )
}
