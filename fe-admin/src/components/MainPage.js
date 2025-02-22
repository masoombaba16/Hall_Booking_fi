import React from "react";
import "./MainPage.css";
import { useEffect } from "react";
import { setBookings,setError } from "../slices/bookingsSlice";
import { setAvailability } from "../slices/availabilitySlice";
import { useDispatch, useSelector } from "react-redux";
const MainPage = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchAvailabilities = async () => {
          try {
            const response = await fetch("http://localhost:5000/public/get-availability");
            const availabilityData = await response.json();
            if (availabilityData.success && Array.isArray(availabilityData.data)) {
              dispatch(setAvailability(availabilityData.data));
            } else {
              dispatch(setError("Failed to Load Bookings."));
            }
          } catch (error) {
            dispatch(setError("Failed to load bookings."));
          }
        };
        fetchAvailabilities();
    
        const intervalId = setInterval(fetchAvailabilities, 60*5*1000);
    
        return () => clearInterval(intervalId);
      }, [dispatch]);
  useEffect(() => {
      const fetchBookings = async () => {
        try {
          const response = await fetch("http://localhost:5000/public/get-bookings");
          const bookingsData = await response.json();
          if (bookingsData.success && Array.isArray(bookingsData.hallBookings)) {
            dispatch(setBookings(bookingsData.hallBookings));
          } else {
            dispatch(setError("Failed to Load Bookings."));
          }
        } catch (error) {
          dispatch(setError("Failed to load bookings."));
        }
      };
      fetchBookings();
  
      const intervalId = setInterval(fetchBookings, 2000);
  
      return () => clearInterval(intervalId);
    }, [dispatch]);
  return (
    <div className="main-page">
      <div className="text-container">
        <h1 className="animated-text">Welcome to</h1>
        <h1 className="highlighted-text">VenueVista</h1>
        <p className="description">
          The ultimate solution for effortless and seamless <span>Hall Booking</span>.
        </p>
      </div>
      <div className="animation-container">
        <div className="circle"></div>
        <div className="circle small"></div>
        <div className="circle medium"></div>
        <div className="circle large"></div>
      </div>
    </div>
  );
};

export default MainPage;
