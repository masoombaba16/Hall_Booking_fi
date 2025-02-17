import React, { useState } from 'react';
import styled from 'styled-components';

const Radio = ({ onChange }) => {
  const [selectedOption, setSelectedOption] = useState("Bookings");

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    onChange(value); 
  };

  return (
    <StyledWrapper>
      <div id="firstFilter" className="filter-switch">
        <input
          defaultChecked
          id="option1"
          name="options"
          type="radio"
          value="Bookings"
          onChange={handleChange}
        />
        <label className="option" htmlFor="option1">Bookings</label>

        <input
          id="option2"
          name="options"
          type="radio"
          value="Availability"
          onChange={handleChange}
        />
        <label className="option" htmlFor="option2">Availability</label>

        <span className="background" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .filter-switch {
    border: 2px solid maroon;
    border-radius: 30px;
    position: absolute;
    right: 5vw;
    top: 12vh;
    display: flex;
    align-items: center;
    height: 50px;
    width: 400px;
    overflow: hidden;
  }
  .filter-switch input {
    display: none;
  }
  .filter-switch label {
    flex: 1;
    text-align: center;
    cursor: pointer;
    border: none;
    border-radius: 30px;
    position: relative;
    overflow: hidden;
    z-index: 1;
    transition: all 0.5s;
    font-weight: 500;
    font-size: 18px;
  }
  .filter-switch .background {
    position: absolute;
    width: 49%;
    height: 38px;
    background-color: green;
    top: 4px;
    left: 4px;
    border-radius: 30px;
    transition: left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  #option2:checked ~ .background {
    left: 50%;
  }
  #option1:checked + label[for="option1"] {
    color: #212121;
    font-weight: bold;
  }
  #option2:checked + label[for="option2"] {
    color: #212121;
    font-weight: bold;
  }
  #option1:not(:checked) + label[for="option1"],
  #option2:not(:checked) + label[for="option2"] {
    color: #7d7d7d;
  }
`;

export default Radio;
