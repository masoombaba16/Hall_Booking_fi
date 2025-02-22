import { createSlice } from "@reduxjs/toolkit";

export const bookingsSlice = createSlice({
  name: "bookings",
  initialState: {
    bookingsData: [], 
    error: null,
  },
  reducers: {
    setBookings: (state, action) => {
      state.bookingsData = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setBookings, setError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
