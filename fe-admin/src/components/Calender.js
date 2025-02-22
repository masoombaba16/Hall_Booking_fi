import React, { useState ,useEffect} from 'react';
import './Calender.css'
import Next from '../images/calnext.png'
import Prev from '../images/calprev.png'
import Toda from '../images/caltoday.png'
import CalFilt from '../images/calfit.png'
import NextLO from '../images/next.png';
const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [filterDate, setFilterDate] = useState('');
    const [filteredDay, setFilteredDay] = useState(null);
    const [disableTodayHighlight, setDisableTodayHighlight] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
  
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()); 
  
    const getFirstDayOfMonth = () => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      return date.getDay();
    };
  
    const getDaysInMonth = () => {
      return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    };
  
    const getMonthName = () => {
      return currentDate.toLocaleString('default', { month: 'long' });
    };
    const handlePreviousMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        if (newDate >= minDate) {
          setCurrentDate(newDate);
        }
      };
      
      const handleNextMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        if (newDate <= maxDate) {
          setCurrentDate(newDate);
        }
      };
  
    const handleTodayClick = () => {
      setCurrentDate(today);
      setSelectedDay(today.getDate());
      setFilteredDay(null);
      setDisableTodayHighlight(false);
    };
  
    const handleFilterDateChange = (e) => {
      setFilterDate(e.target.value);
    };
  
    const handleApplyFilter = () => {
      const [day, month, year] = filterDate.split('/').map(Number);
      const parsedDate = new Date(year, month - 1, day);

      const formatDate = (date) => {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); 
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      };

      if (
        parsedDate.getDate() === day &&
        parsedDate.getMonth() + 1 === month &&
        parsedDate.getFullYear() === year
      ) {
   
        if (parsedDate >= minDate && parsedDate <= maxDate) {
          setCurrentDate(parsedDate);
          setFilteredDay(day);
          setErrorMessage(''); 
        } else {
          setErrorMessage(`Only data from ${formatDate(minDate)} to ${formatDate(maxDate)} is available.`);
        }
      } else {
        setErrorMessage('Invalid date entered. Please use the format dd/mm/yyyy.');
      }
    };
    useEffect(() => {
      if (filterDate) {
        setDisableTodayHighlight(true); 
      }
    }, [filterDate]); 
  
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysArray = Array.from({ length: getDaysInMonth() }, (_, index) => index + 1);
    const emptyDays = Array(getFirstDayOfMonth()).fill(null);
  
    const isToday = (day) => {
      return (
        today.getDate() === day &&
        today.getMonth() === currentDate.getMonth() &&
        today.getFullYear() === currentDate.getFullYear() &&
        !disableTodayHighlight
      );
    };
  
    const handleDayClick = (day) => {
      setSelectedDay(day);
    };
  
    return (
      <div className="calendar">
        <header>
          <h1>{getMonthName()} {currentDate.getFullYear()}</h1>
        </header>
        <div className="filter-date">
          <img src={CalFilt} className="calfit" alt="" />
          <input
            type="text"
            placeholder="Enter date (dd/mm/yyyy)"
            value={filterDate}
            onChange={handleFilterDateChange}
            className="filt"
          />
          <div className="filt-cont">
            <button onClick={handleApplyFilter} className="filtbut">Go</button>
            <img src={NextLO} className="nextlo" alt="" />
          </div>
        </div>
        <div className="days-of-week">
          {daysOfWeek.map((day) => (
            <div className="day-of-week" key={day}>
              {day}
            </div>
          ))}
        </div>
        <div className="days">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="empty-day"></div>
          ))}
          {daysArray.map((day) => {
            const isTodayClass = isToday(day);
            const isSelectedClass = !isTodayClass && (filteredDay === day || selectedDay === day);
  
            return (
              <div
                key={day}
                className={`day ${isTodayClass ? 'today' : ''} ${isSelectedClass ? 'selected' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                {day}
              </div>
            );
          })}
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div className="but">
  <div className="prev" onClick={handlePreviousMonth}>
    <img src={Prev} className="prev-logo" alt="" />
    <button disabled={currentDate <= minDate}>Previous</button>
  </div>
  <div className="toda" onClick={handleTodayClick}>
    <img src={Toda} className="toda-logo" alt="" />
    <button>Today</button>
  </div>
  <div className="next" onClick={handleNextMonth}>
    <button disabled={currentDate >= maxDate}>Next</button>
    <img src={Next} className="next-logo" alt="" />
  </div>
</div>
      </div>
    );
  };
  
  export default Calendar;