import { createSlice } from "@reduxjs/toolkit";

export const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    bookingsData: [],
    availabilityData: [],
    error: null,
  },
  reducers: {
    setBookings: (state, action) => {
      state.bookingsData = action.payload;
    },
    setAvailability: (state, action) => {
      state.availabilityData = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setBookings, setAvailability, setError } = bookingSlice.actions;
export default bookingSlice.reducer;
