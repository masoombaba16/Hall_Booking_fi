import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";

const CalendarComponent = ({ selectedDate, onDateChange }) => {
  
  return (
    <div className="calendar-container">
      <div className="calendar-layout">
        <div className="cal">
          <h1 className="calendar-title">All Bookings</h1>
          <Calendar onChange={onDateChange} value={selectedDate} />
          <div className="legend">
            <div className="msp">
              <div className="available"></div>
              <p>Slots Available</p>
            </div>
            <div className="msp">
              <div className="unavailable"></div>
              <p>Unavailable Slots</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
