import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";

const CalendarComponent = ({ selectedDate, onDateChange, selectedOption }) => {
  // Function to disable specific dates based on the selected option
  const disableDates = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

    // Disable Sundays (day === 0) in both views
    if (date.getDay() === 0) return true;

    // In Availability view: Disable past dates
    if (selectedOption === "Availability" && date < today) return true;

    return false;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-layout">
        <div className="cal">
          <h1 className="calendar-title">
            {selectedOption === "Bookings" ? "All Bookings" : "Check Availability"}
          </h1>
          <Calendar
            onChange={onDateChange}
            value={selectedDate}
            tileDisabled={disableDates} // Disable logic applied here
          />
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
