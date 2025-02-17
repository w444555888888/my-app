/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 22:29:00
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2025-02-17 21:07:42
 * @FilePath: \my-app\src\redux\userSlice.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { request } from '../utils/apiService'




export const reduxAsyncGetAllHotels = createAsyncThunk('user/fetchHotels', async (_, { rejectWithValue }) => {
  try {
    const response = await request('GET', '/hotels')
    return response.success ? response.data : rejectWithValue(response.message)
  } catch (err) {
    console.error('reduxAsyncGetAllHotels error:', err)
    return rejectWithValue('reduxAsyncGetAllHotels error')
  }
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
      .addCase(reduxAsyncGetAllHotels.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(reduxAsyncGetAllHotels.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.Hotels = action.payload
      })
      .addCase(reduxAsyncGetAllHotels.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { logIn, logOut, toggleTheme } = userSlice.actions

export default userSlice.reducer
