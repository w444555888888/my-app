/*
 * @Author: w444555888 w444555888@yahoo.com.tw
 * @Date: 2024-07-18 22:29:00
 * @LastEditors: w444555888 w444555888@yahoo.com.tw
 * @LastEditTime: 2024-07-27 18:56:07
 * @FilePath: \my-app\src\redux\userSlice.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchUsers = createAsyncThunk('fetchUsers', async () => {
  const response = await fetch('http://localhost:3000/users')
  return response.json()
})

export const axiosHotels = createAsyncThunk('axiosHotels', async () => {
  const response = await axios.get('http://localhost:5000/api/v1/hotels')
  return response.data
})




const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLoggedIn: !!localStorage.getItem('username'),
    users: [],
    Hotels: [],
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

export const { logIn, logOut } = userSlice.actions

export default userSlice.reducer
