import React, { useEffect, useState } from 'react';
import Profile from '../images/profile.png';
import Exit from '../images/exit.png';
import calender from '../images/calender.png';
import Calendar from './Calender';
import { useSelector } from 'react-redux';
import AddClub from './ManageClub/AddClub';
import BlockClub from './ManageClub/BlockClub';
import AddHall from './ManageHall/AddHall';
import EditHall from './ManageHall/EditHall';
import { sethallData, setError } from '../slices/hallSlice';
import { setBookings } from '../slices/bookingsSlice';
import {setclubData} from '../slices/clubSlice'
import { useDispatch } from 'react-redux';
import './SideMenus.css';
import { setAvailability } from '../slices/availabilitySlice';
function SideMenus({ isMenuOpen, closeMenu, selectedDate }) {
  const [isEditHallFormOpen, setIsEditHallFormOpen] = useState(false);
  const [isAddClubFormOpen, setIsAddClubFormOpen] = useState(false);
  const [isBlockClubFormOpen, setIsBlockClubFormOpen] = useState(false);
  const [isUnblockClubFormOpen, setIsUnblockClubFormOpen] = useState(false);
  const [isAddHallFormOpen, setIsAddHallFormOpen] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isHallMenuOpen, setHallMenuOpen] = useState(false);
  const [isClubMenuOpen, setClubMenuOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await fetch("http://localhost:5000/public/get-all-halls");
        const data = await response.json();  
        if (data.success) {
          dispatch(sethallData(data.halls));
        } else {
          dispatch(setError("Failed to load halls."));
        }
      } catch (error) {
        dispatch(setError("Failed to load halls."));
      }
    };

    fetchHalls();
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
    const fetchClubs = async () => {
      try {
        const response = await fetch("http://localhost:5000/public/get-all-clubs");
        const data = await response.json();
        
        if (data.success) {
          dispatch(setclubData(data.clubs));
        } else {
          dispatch(setError("Failed to load clubs."));
        }
      } catch (error) {
        dispatch(setError("Failed to load clubs."));
      }
    };

    fetchClubs();
  }, [dispatch]);
  const toggleCalendar = () => {
    setCalendarOpen(!isCalendarOpen);
    setIsMaximized(!isMaximized);
  };
  
  const toggleEditHallForm = () => {
    setIsEditHallFormOpen(!isEditHallFormOpen);
  };

  const toggleAddHallForm = () => {
    setIsAddHallFormOpen(!isAddHallFormOpen);
  };

  const toggleAddClubForm = () => {
    setIsAddClubFormOpen(!isAddClubFormOpen);
  };

  const toggleBlockUnblockClubForm = () => {
    setIsBlockClubFormOpen(!isBlockClubFormOpen);
  };



  const toggleHallMenu = () => {
    if (isHallMenuOpen) {
      setHallMenuOpen(false);
      setActiveMenu(null);
    } else {
      setHallMenuOpen(true);
      setClubMenuOpen(false);
      setActiveMenu('hall');
    }
  };

  const toggleClub = () => {
    if (isClubMenuOpen) {
      setClubMenuOpen(false);
      setActiveMenu(null);
    } else {
      setClubMenuOpen(true);
      setHallMenuOpen(false);
      setActiveMenu('club');
    }
  };

  if (!isMenuOpen) return null;

  return (
    <div className={`sideMenu ${isMaximized ? 'expanded' : ''}`}>
      <img src={Exit} alt="Exit" className="exit-logo" onClick={closeMenu} />

      <div className="profile">
        <div className="pf">
          <img src={Profile} className="profile-logo" alt="Profile" />
          <p>
            <i>Hey..! </i>
            {userData?.username || 'Guest'}.
          </p>
        </div>
      </div>
      
      <div className={`content ${isCalendarOpen ? 'expanded' : ''}`}>
        <ul>
          <li
            onClick={toggleHallMenu}
            className={`hall-menu-item ${isHallMenuOpen && activeMenu === 'hall' ? 'active' : ''}`}
          >
            Manage Halls
          </li>
          {isHallMenuOpen && (
            <ul className="hall-options">
              <li onClick={toggleAddHallForm}>Add Hall</li>
              <li onClick={toggleEditHallForm}>Edit Hall</li> 
            </ul>
          )}
          <li
            onClick={toggleClub}
            className={`hall-menu-item ${isClubMenuOpen && activeMenu === 'club' ? 'active' : ''}`}
          >
            Manage Clubs
          </li>
          {isClubMenuOpen && (
            <ul className="hall-options">
              <li onClick={toggleAddClubForm}>Add Club</li>
              <li onClick={toggleBlockUnblockClubForm}>Block / Unblock Club</li>
            </ul>
          )}
        </ul>
        
      </div>

      {isEditHallFormOpen && <EditHall isOpen={isEditHallFormOpen} onClose={toggleEditHallForm} />}

      <AddClub isOpen={isAddClubFormOpen} onClose={toggleAddClubForm} />
      <BlockClub isOpen={isBlockClubFormOpen} onClose={toggleBlockUnblockClubForm} />
      <AddHall isOpen={isAddHallFormOpen} onClose={toggleAddHallForm} />
    </div>
  );
}

export default SideMenus;
