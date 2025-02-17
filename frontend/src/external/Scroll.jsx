import React from 'react';
import styled from 'styled-components';

const Scroll = () => {
  return (
    <StyledWrapper>
      <button className="button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 97 162" height={162} width={97} className="svg">
          <path fill="#262626" d="M47.2124 0H54.0796V151.644L86.6991 128.712H97L50.646 162L0 128.712H10.3009L47.2124 151.644V0Z" />
        </svg>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    width: 38px;
    height: 82px;
    padding: 2px;
    border: 1px solid #474747;
    border-radius: 50px;
    background: rgba(141, 141, 141, 0.18);
    transition: all 0.3s ease-in-out;
    transform: rotate(180deg);
    position:absolute;
    right:30px;
    top:70vh;
  }

  .svg {
    width: 22px;
    height: 62px;
    transform: rotate(180deg);
  }

  .button:hover {
    transform: scale(-1.2);
  }

  .button:focus {
    height: 0px;
    width: 0px;
    padding: 0px;
    border: 0px;
  }

  .button:focus > .svg {
    display: none;
    height: 0px;
  }`;

export default Scroll;
