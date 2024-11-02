import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './DateRangePicker.css';

function DateRangePicker({ startDate, endDate, onDateChange }) {
  const handleStartDateChange = (date) => {
    onDateChange({ startDate: date, endDate });
  };

  const handleEndDateChange = (date) => {
    onDateChange({ startDate, endDate: date });
  };

  return (
    <div className="date-range-picker">
      <div className="date-picker-container">
        <div className="date-picker-wrapper">
          <label>Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="MM/dd/yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            placeholderText="Select start date"
          />
        </div>

        <div className="date-picker-wrapper">
          <label>End Date</label>
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="MM/dd/yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            placeholderText="Select end date"
          />
        </div>
      </div>
      <div className="archive-toggle">
        <label>
          <input
            type="checkbox"
            onChange={(e) => onDateChange({ startDate, endDate, ignoreDate: e.target.checked })}
          />
          Search Archive
        </label>
      </div>
    </div>
  );
}

export default DateRangePicker;