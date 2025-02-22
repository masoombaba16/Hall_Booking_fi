import React, { useState, useEffect, useMemo } from 'react';
import './Header.css';
import SearchIcon from '../images/search.png';
import LoginIcon from '../images/login.png';
import MenuIcon from '../images/menu.png';
import Logo from '../images/weblogo.png';
import SideMenus from './SideMenus';
import CalendarComponent from './CalendarComponent';
import { useSelector } from 'react-redux';

function Header() {
  const [isMenuOpen, setMenu] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const { userData, error } = useSelector((state) => state.user);
  const [isAdmin, setAdmin] = useState(false);  // Fixed: useState initialized correctly

  // Set isAdmin based on userData.userType
  useEffect(() => {
    if (userData?.userType === 'admin') {
      setAdmin(true);
    } else {
      setAdmin(false);
    }
  }, [userData]);

  // Live date and time updates
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Memoized date and time formatting
  const currentDate = useMemo(() => dateTime.toLocaleDateString('en-GB'), [dateTime]);
  const currentTime = useMemo(() => dateTime.toLocaleTimeString(), [dateTime]);

  const toggleMenu = () => setMenu((prev) => !prev);
  const handleMenuItemClick = (index) => setActiveMenuItem(index);

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src={Logo} className="mainlogo" alt="Website Logo" />
        </div>

        <div className="search">
          <img src={SearchIcon} alt="Search Icon" />
          <input
            type="text"
            placeholder="Search for Upcoming Events or Auditoriums"
            aria-label="Search for events"
          />
        </div>

        <div className="signin">
          <img src={LoginIcon} className="signin-logo" alt="Sign In" />
          {error ? (
            <p className="error-message">Error: {error}</p>
          ) : userData ? (
            <p className="name">
              Hello..! <strong>{userData.username}</strong> ({userData.userType})
            </p>
          ) : (
            <p className="loading">Loading user data...</p>
          )}
        </div>

        <div className="loc">
          <div className="cont">
            <p>
              <strong>Date:</strong> <i>{currentDate}</i>
            </p>
            <p>
              <strong>Time:</strong> <i>{currentTime}</i>
            </p>
          </div>
        </div>

        <div className="menu" onClick={toggleMenu} role="button" aria-label="Toggle Menu">
          <p>Menu</p>
          <img src={MenuIcon} alt="Menu Icon" className="menu-card" />
        </div>

        <SideMenus
          isMenuOpen={isMenuOpen}
          closeMenu={() => setMenu(false)}
          selectedDate={currentDate}
          activeMenuItem={activeMenuItem}
          handleMenuItemClick={handleMenuItemClick}
        />
      </header>

      <main className="main-cont">
        <CalendarComponent isAdmin={isAdmin} />
      </main>
    </div>
  );
}

export default Header;
