import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";
import { useSelector } from "react-redux";

const CalendarComponent = ({ isAdmin }) => {
  const { availabilityData } = useSelector((state) => state.availability);
  const { bookingsData } = useSelector((state) => state.bookings);
  const [localBookings, setLocalBookings] = useState([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("bookings");

  useEffect(() => {
    setLocalBookings(bookingsData);
  }, [bookingsData]);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const selectedDate = formatDate(date);

  // Group bookings by hall for the selected date
  const groupedBookings = localBookings
    .map((hall) => ({
      hall_name: hall.hall_name,
      bookings: hall.bookings.filter(
        (booking) => booking.booking_date === selectedDate
      ),
    }))
    .filter((hall) => hall.bookings.length > 0);

  // Determine available halls and slots
  const availableHalls = availabilityData
    .map((hall) => {
      const hallBookings =
        bookingsData.find((b) => b.hall_name === hall.hall_name)?.bookings || [];

      // Get all booked slots for this hall on the selected date
      const bookedSlots = hallBookings
        .filter((booking) => booking.booking_date === selectedDate)
        .map((b) => b.slot);

      let availableSlots = [];

      if (bookedSlots.includes("FullDay")) {
        availableSlots = []; // No slots available if FullDay is booked
      } else if (bookedSlots.includes("FN") && bookedSlots.includes("AN")) {
        availableSlots = []; // No slots available if both FN & AN are booked separately
      } else if (bookedSlots.includes("FN")) {
        availableSlots = ["AN"]; // If FN is booked, only AN is available
      } else if (bookedSlots.includes("AN")) {
        availableSlots = ["FN"]; // If AN is booked, only FN is available
      } else {
        availableSlots = ["FN", "AN"]; // If no bookings, both slots are available
      }

      return {
        hall_name: hall.hall_name,
        availableSlots,
      };
    })
    .filter((hall) => hall.availableSlots.length > 0); // Remove halls that have no available slots

  return (
    <div className="calendar-container">
      <div className="calendar-layout">
        <div className="cal">
          <h1 className="calendar-title">All Bookings</h1>
          <Calendar onChange={setDate} value={date} />
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

        <div className="bookings">
          <div className="toggle-button-container">
            <button
              onClick={() => setView("bookings")}
              className={`toggle-button ${view === "bookings" ? "active" : ""}`}
            >
              Bookings
            </button>
            <button
              onClick={() => setView("availability")}
              className={`toggle-button ${
                view === "availability" ? "active" : ""
              }`}
            >
              Availability
            </button>
          </div>
          <h2>
            {view === "bookings"
              ? `Bookings on ${selectedDate}`
              : `Availabilities on ${selectedDate}`}
          </h2>

          {view === "bookings" ? (
            groupedBookings.length > 0 ? (
              groupedBookings.map((hall, index) => (
                <div key={index} className="hall-card booked">
                  <div className="each-hall">
                    <h3>{hall.hall_name.toUpperCase()}</h3>
                    {hall.bookings.map((booking, idx) => (
                      <div key={idx} className="booking-card">
                        <p>
                          <strong>Slot:</strong>{" "}
                          {booking.slot === "FN"
                            ? "FN - (10:00 AM to 1:00 PM)"
                            : booking.slot === "AN"
                            ? "AN - (2:00 PM to 5:00 PM)"
                            : booking.slot === "Full Day"
                            ? "Full Day - (9:00 AM to 5:00 PM)"
                            : "Invalid Slot"}
                        </p>
                        <p>
                          <strong>Booked by:</strong> {booking.clubname}
                        </p>
                        {booking.event_name && (
                          <p>
                            <strong>Event Name:</strong> {booking.event_name}
                          </p>
                        )}
                        
                        <button className="know">More Info..</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="conte">No bookings available for the day...</p>
            )
          ) : (
            <div className="availability-list">
  {availableHalls.length > 0 ? (
    availableHalls.map((hall, index) => (
      <div key={index} className="hall-card">
        <div className="each-hall-ava">
          <h3 id="halname">{hall.hall_name.toUpperCase()}</h3>
          <p>
            <strong>Available slots:</strong>
          </p>
          <div className="slot-buttons">
            {hall.availableSlots.map((slot, idx) => (
              <button 
                key={idx} 
                className={`slot-button ${isAdmin ? 'disabled-slot' : ''}`}
                disabled={isAdmin}
              >
                <span className="slot-name">{slot}</span>
                <span className="slot-time">
                  {slot === "FN"
                    ? "(9:00 AM to 1:00 PM)"
                    : slot === "AN"
                    ? "(1:40 PM to 5:00 PM)"
                    : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    ))
  ) : (
    <p>No available halls</p>
  )}
</div>

          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
