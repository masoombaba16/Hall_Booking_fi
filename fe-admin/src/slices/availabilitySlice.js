import { createSlice } from "@reduxjs/toolkit";

export const availabilitySlice = createSlice({
  name: "availability",
  initialState: {
    availabilityData: [], // ✅ Ensure correct initial state
    error: null,
  },
  reducers: {
    setAvailability: (state, action) => {
      state.availabilityData = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setAvailability, setError } = availabilitySlice.actions;
export default availabilitySlice.reducer;
