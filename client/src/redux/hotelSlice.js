import { createSlice } from '@reduxjs/toolkit';

const hotelSlice = createSlice({
  name: 'hotel',
  initialState: {
    currentHotel: null,
    availableRooms: [],
  },
  reducers: {
    setCurrentHotel: (state, action) => {
      state.currentHotel = action.payload;
    },
    setAvailableRooms: (state, action) => {
      state.availableRooms = action.payload;
    }
  },
});

export const { setCurrentHotel, setAvailableRooms } = hotelSlice.actions;
export default hotelSlice.reducer;