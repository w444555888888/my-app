/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-10-10 12:40:41
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-10-10 13:28:28
 * @FilePath: \my-app\client\src\pages\ResetPassword.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

const ResetPassword = () => {
  const { token } = useParams() // 從 URL 中獲取 token
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  const handlePasswordReset = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(`http://localhost:5000/api/v1/auth/reset-password/${token}`, { password: newPassword })       
      setMessage(response.data.message)
    } catch (error) {
      console.error("Error resetting password: ", error)
      setMessage("重置密碼失敗，請再試一次。")
    }
  }

  return (
    <div>
      <h2>重置密碼</h2>
      <form onSubmit={handlePasswordReset}>
        <div>
          <label htmlFor="password">新密碼：</label>
          <input
            type="password"
            id="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">提交新密碼</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default ResetPassword