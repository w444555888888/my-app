import React from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import './dateRangePicker.scss';

const DateRangePicker = ({ dates, setDates, setStartDate, setEndDate, onClose }) => {
  const handleDateChange = (item) => {
    setDates([item.selection]);
    const start = format(item.selection.startDate, 'yyyy-MM-dd');
    const end = format(item.selection.endDate, 'yyyy-MM-dd');
    setStartDate(start);
    setEndDate(end);

    if (start !== end) {
      onClose?.();
    }
  };

  return (
    <DateRange
      editableDateInputs={true}
      onChange={handleDateChange}
      moveRangeOnFirstSelection={false}
      ranges={dates}
      className="date"
      minDate={new Date()}
    />
  );
};

export default DateRangePicker;