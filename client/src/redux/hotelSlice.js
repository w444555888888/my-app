import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '../utils/apiService';

export const fetchHotelData = createAsyncThunk(
  'hotel/fetchHotelData',
  async (searchParams, { rejectWithValue }) => {
    const result = await request('GET', `/hotels/search?${searchParams.toString()}`)
    return result.success ? result.data[0] : rejectWithValue(result.message);
  }
)

const hotelSlice = createSlice({
  name: 'hotel',
  initialState: {
    currentHotel: null,
    availableRooms: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentHotel: (state, action) => {
      state.currentHotel = action.payload
    },
    setAvailableRooms: (state, action) => {
      state.availableRooms = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotelData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHotelData.fulfilled, (state, action) => {
        state.loading = false
        state.currentHotel = action.payload
        state.availableRooms = action.payload.availableRooms
      })
      .addCase(fetchHotelData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Fetch failed'
      })
  }
})


export const { setCurrentHotel, setAvailableRooms } = hotelSlice.actions;
export default hotelSlice.reducer;