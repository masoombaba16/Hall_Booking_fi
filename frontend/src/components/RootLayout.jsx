import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBookings, setAvailability, setError } from "../slices/bookingSlice";
import Scroll from "../external/Scroll";
import Radio from "../external/Radio";
import CalendarComponent from "./CalendarComponent";
import "./RootLayout.css";
import Card from "../external/Card";
import { motion } from "framer-motion"; 
import FormLogin from "../external/FormLogin";
import axios from "axios";

function RootLayout() {
  const [log, setLog] = useState(true);
  const [selectedOption, setSelectedOption] = useState("Bookings");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingStatus, setBookingStatus] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false); 

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
    const validateToken = async () => {
      try {
        const res = await axios.get("http://localhost:5002/public/validate-token", {
          withCredentials: true, 
        });
        console.log(res);
      } catch (error) {
        console.error("Error validating token:", error);
      }
    };
  
    validateToken();
  }, [])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, availabilityRes] = await Promise.all([
          fetch("http://localhost:5002/public/get-bookings"),
          fetch("http://localhost:5002/public/get-availability"),
        ]);

        const bookingsData = await bookingsRes.json();
        const availabilityData = await availabilityRes.json();
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
      imageLinks: hall.imageLinks || [],
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
      timing: slot === "FN" ? "10:00 AM - 1:00 PM" : "2:00 PM - 5:00 PM",
    }));

    return {
      hall_name: hall.hall_name,
      bookings: availableSlots,
    };
  });

  const handleBooking = (slot) => {
    if (log) {
      alert("You must log in first to make a booking!");
      return;
    }
    alert(`Booking ${slot} is successful!`);
  };

  const toggleLoginForm = () => {
    setShowLoginForm(!showLoginForm);
    console.log("Show login form:", !showLoginForm);  // Debugging line
  };
  

  return (
    <div>
      <header>
  {log ? (
    <button type="button" className="login-button" onClick={toggleLoginForm}>
      Login
    </button>
  ) : (
    <button type="button" className="login-button">Logout</button>
  )}
</header>

{showLoginForm && (
  <>
    <div className="overlay" onClick={toggleLoginForm}></div> 
    <div className="login-form">
      <FormLogin 
        log={log}
        setLog={setLog}
        toggleLoginForm={toggleLoginForm}
      />
    </div>
  </>
)}



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

        {bookingStatus && <p className="success">{bookingStatus}</p>}

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
                          {i !== hall.bookings.length - 1 && <hr />}
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
                filteredAvailability
                  .filter(hall => hall.bookings.some(booking => booking.status === "Available"))
                  .map((hall, index) => {
                    const availableSlots = hall.bookings.filter(booking => booking.status === "Available");
                    const hasBothSlots = availableSlots.some(slot => slot.slot === "FN") && availableSlots.some(slot => slot.slot === "AN");

                    return (
                      <Card
                        key={index}
                        title={<>Hall Name: <i>{hall.hall_name.toUpperCase()}</i></>}
                        details={
                          <>
                            {availableSlots.map((booking, i) => (
                              <motion.button
                                key={booking.slot}
                                className={`availability-btn ${booking.status.toLowerCase()}`}
                                onClick={() => handleBooking(booking.slot, hall.hall_name)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                {booking.slot} <br /><p>({booking.timing})</p>
                              </motion.button>
                            ))}
                            {hasBothSlots && (
                              <motion.button
                                className="availability-btn full-day"
                                onClick={() => handleBooking("FL", hall.hall_name)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                Full Day <br /><p>(9:00 AM to 4:40 PM )</p>
                              </motion.button>
                            )}
                          </>
                        }
                        backgroundImages={hall.imageLinks || []}
                      />
                    );
                  })
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
