import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';

const ForgotChange = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    if (!email) {
      navigate('/'); // Redirect if email is not available
    }
  }, [email, navigate]);

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      alert('Please enter a new password.');
      return;
    }
    setLoading(true); // Show loader
    try {
      const response = await axios.post(
        'http://localhost:5002/public/change-password',
        { email, newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );
      alert(response.data.message);
      setNewPassword(''); // Clear the password field
      navigate('/'); // Redirect to the homepage after successful change
    } catch (error) {
      console.error('Password change failed:', error.response ? error.response.data : error);
      alert('Failed to change password. Please try again.');
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <StyledWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form className="group" onSubmit={handleSubmit}>
          <svg stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <input
            className="input-change"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={handlePasswordChange}
          />
          <button className="action" type="submit">Change Password</button>
        </form>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .group {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    max-width: 300px;
    margin: auto;
    margin-top: 35vh;
    padding: 20px;
    border-radius: 12px;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .input-change {
    width: 100%;
    height: 45px;
    line-height: 30px;
    padding: 0 5rem;
    padding-left: 3rem;
    margin-bottom: 16px;
    border: 2px solid transparent;
    border-radius: 10px;
    outline: none;
    background-color: #f8fafc;
    color: #0d0c22;
    transition: 0.5s ease;
  }

  .input-change::placeholder {
    color: #94a3b8;
  }

  .input-change:focus,
  .input-change:hover {
    outline: none;
    border-color: rgba(129, 140, 248);
    background-color: #fff;
    box-shadow: 0 0 0 5px rgb(129 140 248 / 30%);
  }

  .icon {
    position: absolute;
    left: 2.5rem;
    top: 2.2rem;
    fill: none;
    width: 1rem;
    height: 1rem;
  }

  .action {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: none;
    background-color: royalblue;
    color: white;
    font-weight: bold;
    cursor: pointer;
  }
`;

export default ForgotChange;
