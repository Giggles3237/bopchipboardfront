import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './DateRangePicker.css';

function DateRangePicker({ startDate, endDate, onDateChange }) {
  return (
    <div className="date-range-picker">
      <DatePicker
        selected={startDate}
        onChange={(date) => onDateChange(date, endDate)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        dateFormat="MM/dd/yyyy"
      />
      <DatePicker
        selected={endDate}
        onChange={(date) => onDateChange(startDate, date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        dateFormat="MM/dd/yyyy"
      />
    </div>
  );
}

export default DateRangePicker;