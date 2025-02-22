import React, { useState, useEffect } from 'react';
import './HallBookingCalendar.css'; // Import styles

const HallBookingCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({});

  // Format the date
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSlots(availabilityData[newDate.toDateString()] || []); // Fetch the slots for the selected date
  };

  // Function to check if a date has available slots
  const hasAvailableSlots = (date) => {
    const slotsForDate = availabilityData[date.toDateString()];
    return slotsForDate && slotsForDate.length > 0;
  };

  // Initialize with some data for the slots and availability
  useEffect(() => {
    const initialData = {
      "Mon Jan 12 2025": ['9:00 AM - 10:00 AM', '11:00 AM - 12:00 PM'],
      "Tue Jan 13 2025": ['1:00 PM - 2:00 PM'],
      "Wed Jan 14 2025": ['10:00 AM - 11:00 AM', '2:00 PM - 3:00 PM'],
    };
    setAvailabilityData(initialData);
  }, []);

  // Format time
  const formatTime = (time) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
  };

  // Calendar rendering logic
  const renderCalendar = () => {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = endDate.getDate();

    let dayCells = [];
    let currentDate = startDate;
    let dayOfWeek = currentDate.getDay();

    // Create empty cells for days before the start of the month
    for (let i = 0; i < dayOfWeek; i++) {
      dayCells.push(<div className="empty-cell" key={`empty-${i}`}></div>);
    }

    // Create cells for each day in the month
    for (let i = 1; i <= totalDays; i++) {
      currentDate.setDate(i);
      const isSelected = currentDate.toDateString() === date.toDateString();
      const isAvailable = hasAvailableSlots(currentDate);
      
      dayCells.push(
        <div
          key={i}
          className={`calendar-cell ${isSelected ? 'selected' : ''} ${isAvailable ? 'available' : ''}`}
          onClick={() => handleDateChange(currentDate)}
        >
          {i}
        </div>
      );
    }

    return dayCells;
  };

  return (
    <div className="calendar-container-slot">
      <h3>Hall Availability Calendar</h3>
      
      <div className="calendar">
        {renderCalendar()}
      </div>

      <div className="availability-info">
        <h4>Available Slots for {formatDate(date)}</h4>
        {slots.length > 0 ? (
          <ul>
            {slots.map((slot, index) => (
              <li key={index}>{slot}</li>
            ))}
          </ul>
        ) : (
          <p>No available slots for this date.</p>
        )}
      </div>
    </div>
  );
};

export default HallBookingCalendar;
