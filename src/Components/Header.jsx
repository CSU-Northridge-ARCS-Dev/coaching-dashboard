import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const Header = ({ pageTitle }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const handleIconClick = () => {
    document.querySelector('input[type="date"]').click();
  };

  const formatDate = (date) => {
    const options = { month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  return (
    <div className="tw-flex tw-justify-between tw-items-center tw-bg-black tw-p-4 tw-text-white">
      <div className="tw-text-2xl tw-font-bold">{pageTitle}</div>
      <div className="tw-text-xl">{formatDate(selectedDate)}</div>
      <div className="tw-flex tw-items-center">
        <input 
          type="date" 
          className="tw-hidden"
          onChange={handleDateChange}
        />
        <IconButton onClick={handleIconClick}>
          <FontAwesomeIcon icon={faCalendarAlt} className="tw-text-white" />
        </IconButton>
      </div>
    </div>
  );
};

export default Header;
