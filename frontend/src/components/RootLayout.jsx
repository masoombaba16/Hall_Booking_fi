import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBookings, setAvailability, setError } from "../slices/bookingSlice";
import Scroll from "../external/Scroll";
import Radio from "../external/Radio";
import CalendarComponent from "./CalendarComponent";
import "./RootLayout.css";
import Card from "../external/Card";

function RootLayout() {
  const [log, setLog] = useState(true);
  const [selectedOption, setSelectedOption] = useState("Bookings");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.bookings.bookingsData);
  const availability = useSelector((state) => state.bookings.availabilityData);
  const error = useSelector((state) => state.bookings.error);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, availabilityRes] = await Promise.all([
          fetch("http://localhost:5002/public/get-bookings"),
          fetch("http://localhost:5002/public/get-availability"),
        ]);

        const bookingsData = await bookingsRes.json();
        const availabilityData = await availabilityRes.json();
        console.log(availabilityData);
        console.log(bookingsData)
        if (bookingsData.success) {
          dispatch(setBookings(bookingsData.hallBookings));
        } else {
          dispatch(setError(bookingsData.message));
        }

        if (availabilityData.success) {
          dispatch(setAvailability(availabilityData.data));
        } else {
          dispatch(setError(availabilityData.message));
        }
      } catch (error) {
        dispatch(setError("Failed to fetch data"));
      }
    };

    fetchData();
  }, [dispatch]);
  const filteredBookings = bookings
  .map((hall) => ({
    hall_name: hall.hall_name,
    bookings: hall.bookings.filter(
      (booking) => booking.booking_date === formatDate(selectedDate)
    ),
    imageLinks: hall.imageLinks || [] // Ensure images are included
  }))
  .filter((hall) => hall.bookings.length > 0);

const filteredAvailability = availability.map((hall) => {
  const bookedSlots = hall.bookings
    .filter((booking) => booking.booking_date === formatDate(selectedDate))
    .map((booking) => booking.slot);

  const allSlots = ["FN", "AN"];
  const availableSlots = allSlots.map((slot) => ({
    slot,
    status: bookedSlots.includes(slot) ? "Booked" : "Available",
  }));

  const fnAvailable = !bookedSlots.includes("FN");
  const anAvailable = !bookedSlots.includes("AN");

  if (fnAvailable && anAvailable) {
    availableSlots.push({ slot: "Full Day", status: "Available" });
  }

  return {
    hall_name: hall.hall_name,
    bookings: availableSlots,
  };
});



  return (
    <div>
      <header>
        {log ? (
          <button type="submit" className="login-button">Login</button>
        ) : (
          <button type="submit" className="login-button">Logout</button>
        )}
      </header>
      <main>
        <div className="info">
          {selectedOption === "Bookings" ? (
            <p className="title">Bookings on {formatDate(selectedDate)}</p>
          ) : (
            <p className="title">Availability on {formatDate(selectedDate)}</p>
          )}
        </div>

        <Radio onChange={setSelectedOption} />
        <CalendarComponent selectedDate={selectedDate} onDateChange={setSelectedDate} />
        
        {error && <p className="error">{error}</p>}

        <div className="data-container">
  {selectedOption === "Bookings" ? (
    <div className="bookings">
      {filteredBookings.length > 0 ? (
       filteredBookings.map((hall, index) => (
        <Card
  key={index}
  title={<>Hall Name: <i>{hall.hall_name.toUpperCase()}</i></>}
  details={
    hall.bookings.map((booking, i) => (
      <div key={booking.id || Math.random()}>
        <strong>Event:</strong> {booking.event_name} {" "}
        <a href={`/event/${booking.event_id}`} style={{ color: "blue", textDecoration: "underline" }}>
          Know more
        </a>
        <br />
        <strong>Slots:</strong> {booking.slot} | <strong>Timings:</strong> {booking.timings}
        <br />
        <strong>Booked By:</strong> {booking.booked_by}
        <br />
        <strong>Booked Date:</strong> {new Date(booking.booked_date).toLocaleDateString()} {" "}
        <strong>Time:</strong> {new Date(booking.booked_date).toLocaleTimeString()}
        {i !== hall.bookings.length - 1 && <hr />} {/* Line appears only between bookings */}
      </div>
    ))
  }
  backgroundImages={hall.imageLinks || []} 
/>

      ))      
      ) : (
        <p className="not-found">No bookings available..</p>
      )}
    </div>
  ) : (
<div className="availability">
  {filteredAvailability.length > 0 ? (
    filteredAvailability.map((hall, index) => (
      <Card
        key={index}
        title={<>Hall Name: <i>{hall.hall_name.toUpperCase()}</i></>}
        details={
          hall.bookings.map((booking, i) => (
            <div key={booking.id || Math.random()}>
              <strong>Slot:</strong> {booking.slot} | <strong>Status:</strong> {booking.status}
              {i !== hall.bookings.length - 1 && <hr />} {/* Line appears only between bookings */}
            </div>
          ))
        }
        backgroundImages={hall.imageLinks || []}
      />
    ))
  ) : (
    <p className="not-found">No availability of Slots..</p>
  )}
</div>

  )}
</div>


        <Scroll />
      </main>
    </div>
  );
}

export default RootLayout;
