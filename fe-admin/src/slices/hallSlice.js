import { createSlice } from '@reduxjs/toolkit';

export let hallSlice = createSlice({
  name: 'hall',
  initialState: {
    hallsData:[],
    error:null, // Default to empty array if no data exists
  },
  reducers: {
    sethallData: (state, action) => {
      state.hallsData = action.payload; // Update halls data in state
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export let { sethallData,setError } = hallSlice.actions;
export default hallSlice.reducer;
