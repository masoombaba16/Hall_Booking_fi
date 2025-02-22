import { createSlice } from '@reduxjs/toolkit';

export let userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    error: null,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      console.log('User Data Received:', action.payload);
      console.log('Updated State:', state.userData); // Confirming state update
    },
    setError: (state, action) => {
      state.error = action.payload;
      console.log('Error Received:', action.payload);
    },
  },
});

export let { setUserData, setError } = userSlice.actions;

export default userSlice.reducer;
