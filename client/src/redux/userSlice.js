/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 22:29:00
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-22 13:46:46
 * @FilePath: \my-app\src\redux\userSlice.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'


export const fetchUsers = createAsyncThunk('fetchUsers', async () => {
  const response = await fetch('http://localhost:3000/users')
  return response.json()
})

export const fetchHotelToDetail = createAsyncThunk('fetchHotelToDetail', async () => {
  const response = await fetch('http://localhost:3000/hotelToDetail')
  return response.json()
})

const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLoggedIn: !!localStorage.getItem('username'),
    users: [],
    HotelToDetail: [],
    status: '',
    error: null,
  },
  reducers: {
    logIn: (state) => {
      state.isLoggedIn = true
    },
    logOut: (state) => {
      state.isLoggedIn = false
      localStorage.removeItem('username')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(fetchHotelToDetail.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchHotelToDetail.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.HotelToDetail = action.payload
      })
      .addCase(fetchHotelToDetail.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { logIn, logOut } = userSlice.actions

export default userSlice.reducer
