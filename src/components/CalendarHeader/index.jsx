import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { goToPreviousMonth, goToNextMonth, goToSpecificMonth, goToToday } from "../../store/calendarSlice";
import "./styles.css";
import { selectDisplayedDateIso } from "../../store/calendarSlice";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarHeader() {
  const dispatch = useDispatch();
  const displayedIso = useSelector(selectDisplayedDateIso);
  const displayed = new Date(displayedIso);
  const month = displayed.getMonth();
  const year = displayed.getFullYear();

  return (
    <div className="calendar-header">
      <div className="nav-left">
        <button className="nav-btn" onClick={() => dispatch(goToPreviousMonth())}>← Prev</button>
      </div>

      <div className="title-block">
        <div className="month-year">
          <span className="month-name">{monthNames[month]}</span>
          <span className="year">{year}</span>
        </div>

        <div className="controls">
          <select
            className="month-select"
            value={month}
            onChange={(e) => dispatch(goToSpecificMonth(parseInt(e.target.value, 10)))}
          >
            {monthNames.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          <button className="today-btn" onClick={() => dispatch(goToToday())}>Today</button>
        </div>
      </div>

      <div className="nav-right">
        <button className="nav-btn" onClick={() => dispatch(goToNextMonth())}>Next →</button>
      </div>
    </div>
  );
}
