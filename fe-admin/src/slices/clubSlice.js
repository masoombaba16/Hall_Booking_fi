import { createSlice } from '@reduxjs/toolkit';

export let clubSlice = createSlice({
  name: 'club',
  initialState: {
    clubsData:[],
    error:null, 
  },
  reducers: {
    setclubData: (state, action) => {
      state.clubsData = action.payload; 
    },
  },
});

export let { setclubData } = clubSlice.actions;
export default clubSlice.reducer;
