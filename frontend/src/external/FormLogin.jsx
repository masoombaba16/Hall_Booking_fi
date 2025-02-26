import React, { useState } from 'react';
import styled from 'styled-components';
import Forget from './Forget';
import Loader from '../components/Loader';

const FormLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showForget, setShowForget] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const toggleForget = () => setShowForget(!showForget);

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setEmailError(!emailValue.includes("@") ? "Email must contain '@'" : "");
  };

  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setEmailError("Email must contain '@'");
      return;
    }

    setLoading(true); // ✅ Start loader
    const payload = { email, password };

    try {
      const response = await fetch("http://localhost:5002/public/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json();
      setLoading(false); // ✅ Stop loader

      if (response.ok) {
        setLoginError("");
        window.location.reload();
      } else {
        setLoginError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setLoginError("An unexpected error occurred. Please try again later.");
      setLoading(false); // ✅ Stop loader on error
    }
  };

  return (
    <StyledWrapper>
      {loading ? (
        <Loader /> // ✅ Show loader when loading
      ) : showForget ? (
        <Forget />
      ) : (
        <form className="form" onSubmit={handleLoginSubmit}>
          <p id='login-now'>Login Now..</p>
          {loginError && <div className="error-message">{loginError}</div>}

          <div className="flex-column">
            <label>Email </label>
            {emailError && <span className="error">{emailError}</span>}
          </div>
          <div className="inputForm">
            <input
              placeholder="Enter your Email"
              className="input-em"
              type="email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>

          <div className="flex-column">
            <label>Password </label>
          </div>
          <div className="inputForm">
            <input
              placeholder="Enter your Password"
              className="input-ps"
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="flex-row">
            <span className="span" onClick={toggleForget}>
              Forgot password?.
            </span>
          </div>

          <button className="button-submit" type="submit">
            Sign In
          </button>
          <p className="p">
            Don't have an account? <span className="span">Sign Up</span>
          </p>
        </form>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 30px;
    width: 450px;
    border-radius: 20px;
    z-index: 3500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  .error-message {
    margin: auto;
    color: red;
  }
  ::placeholder {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  .flex-column > label {
    color: #151717;
    font-weight: 600;
  }
  .inputForm {
    border-radius: 10px;
    height: 50px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    transition: 0.2s ease-in-out;
  }
  .input-em, .input-ps {
    width: 100%;
    height: 80%;
    padding: 10px;
    border-radius: 10px;
    border: none;
  }
  .flex-row {
    display: flex;
    justify-content: space-between;
  }
  .span {
    font-size: 14px;
    margin-left: 5px;
    color: #2d79f3;
    font-weight: 500;
    cursor: pointer;
  }
  .button-submit {
    margin: 20px 0 10px 0;
    background-color: #151717;
    border: none;
    color: white;
    font-size: 15px;
    font-weight: 500;
    border-radius: 10px;
    height: 50px;
    width: 100%;
    cursor: pointer;
  }
  .p {
    text-align: center;
    font-size: 14px;
    color: #151717;
  }
  .error {
    color: red;
    font-size: 12px;
    margin-top: 5px;
  }
`;

export default FormLogin;
