/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 22:29:14
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-18 22:29:24
 * @FilePath: \my-app\src\redux\storeConfig.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userStore'
import hotelReducer from './hotelStore'

const store = configureStore({
  reducer: {
    user: userReducer,
    hotel: hotelReducer,
  },
  devTools: process.env.NODE_ENV !== 'production', 

  // 瀏覽器安裝Redux DevTools(查看狀態管理)
})

export default store