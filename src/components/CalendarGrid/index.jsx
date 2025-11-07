import React from "react";
import CalendarCell from "../CalendarCell";
import "./styles.css";

/**
 * CalendarGrid: builds grid for given month/year and renders CalendarCell components.
 *
 * Props:
 * - month (0-11)
 * - year (full year)
 * - onDayClick(dayNumber)
 * - events: map of events keyed by "YYYY-MM-DD"
 */
function padArray(count) {
    return new Array(count).fill(null);
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

export default function CalendarGrid({ month, year, onDayClick, events = {} }) {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = getDaysInMonth(year, month);

    const cells = [
        ...padArray(firstDayIndex),
        ...Array.from({ length: totalDays }, (_, i) => i + 1)
    ];

    const formatKey = (year, month, day) => {
        const mm = String(month + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        return `${year}-${mm}-${dd}`;
    };

    return (
        <div className="calendar-grid">
            <div className="dow-row">
                {daysOfWeek.map((dayLabel) => (
                    <div
                        key={dayLabel}
                        className={`dow-cell ${
                            dayLabel === "Sun" ? "sun" : dayLabel === "Sat" ? "sat" : ""
                        }`}
                    >
                        {dayLabel}
                    </div>
                ))}
            </div>

            <div className="cells">
                {cells.map((dayNumber, index) => {
                    const key = dayNumber ? formatKey(year, month, dayNumber) : `empty-${index}`;
                    const hasEvents = dayNumber ? !!events[key] : false;
                    return (
                        <CalendarCell
                            key={key}
                            day={dayNumber}
                            hasEvents={hasEvents}
                            onClick={() => onDayClick(dayNumber)}
                            weekDay={(index + firstDayIndex) % 7}
                        />
                    );
                })}
            </div>
        </div>
    );
}
