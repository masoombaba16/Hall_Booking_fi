import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import './Login_Common.css';
import Login from '../images/login.png';
import CollegeVideo from '../images/Website Hero Video.mp4';
import { useNavigate } from 'react-router-dom';

function Login_Common() {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState("Guest");
  const [animationClass, setAnimationClass] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [halls, setHalls] = useState([]);
  const [guestHallIndex, setGuestHallIndex] = useState(0); // Index for halls
  const [guestImageIndex, setGuestImageIndex] = useState(0); // Index for images within a hall
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
    mode: 'onChange',
  });
  let payload;

  const roles = ["Admin", "Guest", "Club", "Organizer"];

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await fetch("http://localhost:5000/public/get-all-halls");
        const data = await response.json();
        if (data.success) {
          setHalls(data.halls);
        } else {
          setErrorMessage("Failed to load halls.");
        }
      } catch (error) {
        console.error("Error fetching halls:", error);
        setErrorMessage("Failed to load halls.");
      }
    };

    fetchHalls();
  }, []);

  useEffect(() => {
    if (currentRole === "Guest" && halls.length > 0) {
      const interval = setInterval(() => {
        // Move to next image in the current hall
        setGuestImageIndex((prevIndex) => (prevIndex + 1) % (halls[guestHallIndex]?.imageLinks.length || 1));
        
        // After the last image, move to the next hall
        if (guestImageIndex === halls[guestHallIndex]?.imageLinks.length - 1) {
          setGuestHallIndex((prevIndex) => (prevIndex + 1) % halls.length);
        }
      }, 3000); // Adjust the time for your slide speed (3000 ms = 3 seconds)
      
      return () => clearInterval(interval);
    }
  }, [currentRole, halls, guestHallIndex, guestImageIndex]);

  const slideRight = () => {
    setAnimationClass("slide-right");
    setErrorMessage('');
    setTimeout(() => {
      const nextRoleIndex = (roles.indexOf(currentRole) + 1) % roles.length;
      setCurrentRole(roles[nextRoleIndex]);
      reset();
      setAnimationClass("");
    }, 500);
  };

  const slideLeft = () => {
    setAnimationClass("slide-left");
    setErrorMessage('');
    setTimeout(() => {
      const prevRoleIndex = (roles.indexOf(currentRole) - 1 + roles.length) % roles.length;
      setCurrentRole(roles[prevRoleIndex]);
      reset();
      setAnimationClass("");
    }, 500);
  };

  const onSubmit = async (data) => {
    if (currentRole === "Guest") {
      navigate("guest");
    } else {
      let payload = {
        password: data.password,
        userType: currentRole.toLowerCase(),
      };
  
      if (currentRole === "Admin") {
        payload.email = data.email; // Admin uses "email"
      } else {
        payload.username = data.email; // Club and Organizer use "username"
      }
  
      let apiUrl = "";
      if (currentRole === "Admin") {
        apiUrl = "http://localhost:5000/admin/login";
      } else if (currentRole === "Club") {
        apiUrl = "http://localhost:5000/club/login";
      } else if (currentRole === "Organizer") {
        apiUrl = "http://localhost:5000/organizer/login";
      }
  
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        });
  
        const responseData = await response.json();
        if (responseData.token && responseData.user) {
          if (currentRole === "Admin") {
            navigate("/admin-dashboard");
          } else if (currentRole === "Club") {
            navigate("/club-dashboard");
          } else if (currentRole === "Organizer") {
            navigate("/organizer-dashboard");
          }
        } else {
          setErrorMessage(responseData.message || "Login failed. Please check your credentials and try again.");
        }
      } catch (error) {
        console.error("Error during login:", error);
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };
  

  return (
    <div className="container">
      <div className="picture">
        <h3><strong><i>VenueVista...</i></strong></h3>
        <div className="head">
          <h1>{currentRole} Login</h1>
          <img src={Login} alt="" className='logo-login' />
        </div>
        <video autoPlay muted loop id="background-video">
          <source src={CollegeVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <p className='vnr'><i><a href="https://vnrvjiet.ac.in/" target='none'>VNR VJIET, Hyd..</a></i></p>
      </div>

      <div className={`login-form ${animationClass}`}>
        <h2>{currentRole} Login</h2>
        {errorMessage && <div className='ero'>{errorMessage}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          {currentRole !== "Guest" && (
            <>
              <div className="input-wrapper">
                <label htmlFor="email">Email :- </label>
                <input
                  type="text"
                  id='email2'
                  placeholder={`Enter ${currentRole === "User" ? "email" : `${currentRole} email`}`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email format"
                    }
                  })}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && <span className="error-message">{errors.email.message}</span>}
              </div>
              <label htmlFor="password">Password :- </label>
              <input
                type="password"
                id='passw'
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && <span className="error-message" id='erq'>{errors.password.message}</span>}
            </>
          )}

          {currentRole === "Guest" && (
            <button type="submit" className="login-button">
              <strong><i>Continue as Guest</i></strong>
            </button>
          )}

          {currentRole !== "Guest" && (
            <button type="submit" disabled={!isValid} className="login-button2">
              <strong><i>Login</i></strong>
            </button>
          )}
        </form>

        <div className="slider-buttons">
          <button onClick={slideLeft} className='sl'>← {roles[(roles.indexOf(currentRole) - 1 + roles.length) % roles.length]}</button>
          <button onClick={slideRight} className='sl'>{roles[(roles.indexOf(currentRole) + 1) % roles.length]} →</button>
        </div>

        {currentRole === "Guest" && halls.length > 0 && (
          <div className="guest-image-slider">
            <button onClick={() => setGuestHallIndex((guestHallIndex - 1 + halls.length) % halls.length)}>←</button>

            <div className="hall-info">
              <img src={halls[guestHallIndex]?.imageLinks[guestImageIndex]} alt="Guest Slide" id='ima' />
              <p className='hallname'>{halls[guestHallIndex]?.hallname.toUpperCase()}</p>

            </div>

            <button onClick={() => setGuestHallIndex((guestHallIndex + 1) % halls.length)}>→</button>
          </div>
        )}

        <div className="dots-container">
          {roles.map((role, index) => (
            <div key={index} className={`dot ${currentRole === role ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login_Common;
