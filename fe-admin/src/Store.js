import { configureStore } from "@reduxjs/toolkit";
import userReducer from './slices/userSlice'
import hallReducer from './slices/hallSlice'
import clubReducer from './slices/clubSlice'
import bookingsReducer from './slices/bookingsSlice'
import availabilityReducer from './slices/availabilitySlice'
export let store = configureStore({
  reducer: {
    user:userReducer,
    hall:hallReducer,
    club:clubReducer,
    bookings:bookingsReducer,
    availability:availabilityReducer,
  },
});
