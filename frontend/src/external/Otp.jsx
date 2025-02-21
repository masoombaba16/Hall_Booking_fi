import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';

const Otp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false); // ✅ Added loading state

  // ✅ Handle OTP input change
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length === 1) {
      const newOtp = otp.substring(0, index) + value + otp.substring(index + 1);
      setOtp(newOtp);
      if (index < 3) document.getElementById(`input${index + 2}`).focus();
    }
  };

  // ✅ Handle OTP Verification
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      alert('Please enter the complete 4-digit OTP.');
      return;
    }
    setLoading(true); // ✅ Show loader when API call starts
    try {
      const response = await axios.post(
        'http://localhost:5002/public/verify-otp',
        { email, otp },
        { headers: { 'Content-Type': 'application/json' } }
      );
      alert(response.data.message);
      navigate('/forgot-change', { state: { email } });
    } catch (error) {
      console.error('OTP verification failed:', error.response ? error.response.data : error);
      alert('Invalid OTP or verification failed. Please try again.');
    } finally {
      setLoading(false); // ✅ Hide loader after API call completes
    }
  };

  // ✅ Handle OTP Resend
  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Show loader when resend starts
    try {
      await axios.post(
        'http://localhost:5002/public/forgot-password',
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      alert(`OTP has been resent to your Email ID: ${email}`);
      setOtp('');
      [...Array(4)].forEach((_, index) => {
        const input = document.getElementById(`input${index + 1}`);
        if (input) input.value = '';
      });
      document.getElementById('input1').focus();
    } catch (error) {
      console.error('Error sending email:', error.response ? error.response.data : error);
      alert('Email ID not found in the database. Please try again.');
    } finally {
      setLoading(false); // ✅ Hide loader after resend completes
    }
  };

  return (
    <StyledWrapper>
      {loading ? (
        <Loader /> // ✅ Show Loader component when loading
      ) : (
        <form className="form" onSubmit={handleVerify}>
          <div className="title">OTP Verification</div>
          <p className="message">
            We have sent a verification code to your Email ID: {email}
          </p>
          <div className="inputs">
            {[...Array(4)].map((_, index) => (
              <input
                key={index}
                id={`input${index + 1}`}
                type="text"
                maxLength={1}
                onChange={(e) => handleOtpChange(e, index)}
              />
            ))}
          </div>
          <button className="resend" onClick={handleResend} disabled={loading}>
            Resend OTP
          </button>
          <button className="action-ver" type="submit" disabled={loading}>
            Verify Me
          </button>
        </form>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .form {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-around;
    width: 300px;
    background-color: white;
    border-radius: 12px;
    padding: 20px;
  }

  .title {
    font-size: 20px;
    font-weight: bold;
    color: black;
  }

  .message {
    color: #a3a3a3;
    font-size: 14px;
    margin-top: 4px;
    text-align: center;
  }

  .inputs {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
  }

  .inputs input {
    width: 32px;
    height: 32px;
    text-align: center;
    border: none;
    border-bottom: 1.5px solid #d2d2d2;
  }

  .inputs input:focus {
    border-bottom: 1.5px solid royalblue;
    outline: none;
  }

  .action-ver {
    margin-top: 24px;
    padding: 12px 16px;
    border-radius: 8px;
    border: none;
    background-color: royalblue;
    color: white;
    cursor: pointer;
    align-self: end;
  }

  .resend {
    background-color: #f0ad4e;
    margin-top: 12px;
  }
`;

export default Otp;
