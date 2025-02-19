import { createSlice } from "@reduxjs/toolkit";

export const userSlice=createSlice({
    name:"user",
    initialState:{
        userData:null,
        error:null,
    },
    reducers:{
        setUserData:(state,action)=>
        {
            state.userData=action.payload;
        },
        setError:(state,action)=>
        {
            state.error=action.payload;
        }
    }
})

export const {setUserData,setError}=userSlice.actions;
export default userSlice.reducer;