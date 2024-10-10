/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 22:29:00
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-08-12 17:38:38
 * @FilePath: \my-app\src\redux\userSlice.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'



export const axiosHotels = createAsyncThunk('axiosHotels', async () => {
  const response = await axios.get('http://localhost:5000/api/v1/hotels')
  return response.data
})



/**
 * 登入狀態 : login
 * 全部飯店 : Hotels
 * 主題 : theme
*/
const userSlice = createSlice({
  name: 'user',
  initialState: {
    login: !!localStorage.getItem('username'),
    Hotels: [],
    theme: 'light',
    status: '',
    error: null,
  },
  reducers: {
    logIn: (state) => { 
      state.login = true
    },
    logOut: (state) => {
      state.login = false
      localStorage.removeItem('username')
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(axiosHotels.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(axiosHotels.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.Hotels = action.payload
      })
      .addCase(axiosHotels.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { logIn, logOut, toggleTheme } = userSlice.actions

export default userSlice.reducer
