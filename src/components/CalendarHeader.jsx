import React from "react";

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function CalendarHeader({ month, year, onPrev, onNext, onSelectMonth, onToday }) {
    return (
        <div className="calendar-header">
            <div className="nav-left">
                <button className="nav-btn" onClick={onPrev}>← Prev</button>
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
                        onChange={(e) => onSelectMonth(parseInt(e.target.value))}
                    >
                        {monthNames.map((m, i) => (
                            <option key={m} value={i}>{m}</option>
                        ))}
                    </select>

                    <button className="today-btn" onClick={onToday}>Today</button>
                </div>
            </div>

            <div className="nav-right">
                <button className="nav-btn" onClick={onNext}>Next →</button>
            </div>
        </div>
    );
}
