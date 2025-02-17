import React from 'react';
import styled from 'styled-components';

const Card = ({ title, details }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="bg" />
        <div className="blob" />
        <div className="content">
    <h3>{title}</h3>
    <p>{details}</p>
  </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
.content {
  position: absolute;
  z-index: 3;
  font-weight: bold;
  padding: 20px;
  width: 100%;
  height: 100%; /* Ensures it takes full height */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centers vertically */
  align-items: center; /* Centers horizontally */
}

  .card {
    position: relative;
    width: 400px;
    height: 250px;
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    left:25px;
    flex-direction: column;
    gap:10px;
    justify-content:center;
    align-items: center;
    margin-top:10px;
    box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;
  }

  .bg {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 390px;
    height: 240px;
    z-index: 2;
    background: rgba(255, 255, 255, .95);
    backdrop-filter: blur(24px);
    border-radius: 10px;
    overflow: hidden;
    outline: 2px solid white;
  }

  .blob {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    background-color: #ff0000;
    opacity: 1;
    filter: blur(20px);
    animation: blob-bounce 5s infinite ease-in-out;
  }

  @keyframes blob-bounce {
    0% {
      transform: translate(-200px, -200px) translate3d(0, 0, 0);
    }
    25% {
      transform: translate(-200px, -200px) translate3d(200px, 0, 0);
    }
    50% {
      transform: translate(-200px, -200px) translate3d(200px, 200px, 0);
    }
    75% {
      transform: translate(-200px, -200px) translate3d(0, 200px, 0);
    }
    100% {
      transform: translate(-200px, -200px) translate3d(0, 0, 0);
    }
  }
`;

export default Card;
