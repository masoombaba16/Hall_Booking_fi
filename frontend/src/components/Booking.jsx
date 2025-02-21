import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Booking.css";
import axios from "axios";
import Loader from "./Loader"; // ⬅️ Import the Loader

function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false); // 🔄 Track loading state

  useEffect(() => {
    if (!state || !state.userDetails || !state.hallDetails) {
      console.warn("⚠️ No booking details provided. Redirecting to home.");
      navigate("/");
    }
  }, [state, navigate]);

  if (!state) return <p>Loading booking details...</p>;
  const { userDetails, hallDetails } = state;

  // ✅ Handle OTP request
  const handleOtpRequest = async (e) => {
    e.preventDefault();
    setLoading(true); // 🔄 Start loading
    try {
      const response = await axios.post("http://localhost:5002/public/send-otp", {
        email: userDetails.email,
      });
      if (response.data.success) {
        alert("✅ OTP sent to your email.");
        setShowOtpForm(true);
      } else {
        alert("⚡ Failed to send OTP: " + response.data.message);
      }
    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      alert("Error sending OTP. Try again.");
    } finally {
      setLoading(false); // 🔄 Stop loading
    }
  };

  // 🚀 Handle OTP verification
  const handleOtpVerification = async () => {
    setLoading(true); // 🔄 Start loading
    try {
      const response = await axios.post(
        "http://localhost:5002/public/verify-otpp",
        { email: userDetails.email, otp },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        alert("🎉 OTP verified. Booking confirmed!");
        await makeBookingRequest(); // Proceed to booking
      } else {
        alert("⚡ OTP Verification failed: " + response.data.message);
      }
    } catch (error) {
      console.error("❌ Error verifying OTP:", error);
      alert("OTP verification failed. Please try again.");
    } finally {
      setLoading(false); // 🔄 Stop loading
    }
  };

  // 📦 Make booking request
  const makeBookingRequest = async () => {
    setLoading(true); // 🔄 Start loading
    try {
      const bookingData = {
        hall_name: hallDetails.hallName,
        booking_date: hallDetails.date,
        booked_by: userDetails.email,
        clubname: userDetails.clubname,
        slot: hallDetails.slot,
        event_name: eventName,
        event_description: eventDescription,
      };

      console.log("📦 Payload being sent:", bookingData);

      const bookingResponse = await axios.post(
        "http://localhost:5002/public/book-hall",
        bookingData,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Booking Response:", bookingResponse.data);

      if (bookingResponse.data.success) {
        alert("🎉 Booking successful!");
        navigate("/"); // 🌟 Navigate after booking
      } else {
        alert("⚡ Booking failed: " + bookingResponse.data.message);
      }
    } catch (error) {
      console.error("❌ Error during booking:", error);
      alert("Booking process failed. Please try again.");
    } finally {
      setLoading(false); // 🔄 Stop loading
    }
  };

  // ⏳ Show loader while loading
  if (loading) return <Loader />;

  return (
    <div className="booking-page">
      <h2>Confirm Your Booking</h2>
      <div className="booking-details">
        <p><strong>Hall Name:</strong> <i>{hallDetails.hallName.toUpperCase()}</i></p>
        <p><strong>Date:</strong> {hallDetails.date}</p>
        <p><strong>Slot:</strong> {hallDetails.slot}</p>
        <p><strong>Timing:</strong> {hallDetails.timing}</p>
        <p><strong>Club Name:</strong> <i>{userDetails.clubname.toUpperCase()}</i></p>
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="confirm-btn">
          Book Now
        </button>
      ) : !showOtpForm ? (
        <form onSubmit={handleOtpRequest} className="event-form">
          <h3>Provide Event Details</h3>
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
          <input
            placeholder="Event Description"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            required
          />
          <button type="submit" className="confirm-btn">
            Confirm Booking
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleOtpVerification(); }} className="otp-form">
          <h3>Enter OTP sent to {userDetails.email}</h3>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="confirm-btn">
            Submit OTP & Confirm Booking
          </button>
        </form>
      )}

      <button
        onClick={() => (showOtpForm ? setShowOtpForm(false) : setShowForm(false))}
        className={`back-btn ${showForm ? "back-btn-form-opened" : ""}`}
      >
        Go Back
      </button>
    </div>
  );
}

export default Booking;
