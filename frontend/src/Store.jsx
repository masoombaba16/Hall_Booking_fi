import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./slices/bookingSlice";
import userReducer from "./slices/userSlice"
export const store = configureStore({
  reducer: {
    bookings: bookingReducer,
    user:userReducer,
  },
});

export default store;
