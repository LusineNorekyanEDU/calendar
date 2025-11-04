import React from "react";
import CalendarCell from "./CalendarCell";

/**
 * CalendarGrid: builds grid for given month/year and renders CalendarCell components.
 *
 * Props:
 * - month (0-11), year (full year)
 * - onDayClick(dayNumber)
 * - events: map of events keyed by "YYYY-MM-DD"
 */
function padArray(count) {
    return new Array(count).fill(null);
}

function daysInMonth(year, month) {
    // month: 0-11
    return new Date(year, month + 1, 0).getDate();
}

export default function CalendarGrid({ month, year, onDayClick, events = {} }) {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0-6
    const totalDays = daysInMonth(year, month);

    // Build array of cell descriptors. null means empty cell before start.
    const cells = [
        ...padArray(firstDayIndex),
        ...Array.from({ length: totalDays }, (_, i) => i + 1)
    ];

    // helper to build key
    const formatKey = (y, m, d) => {
        const mm = String(m + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        return `${y}-${mm}-${dd}`;
    };

    return (
        <div className="calendar-grid">
            <div className="dow-row">
                {daysOfWeek.map((d) => (
                    <div key={d} className={`dow-cell ${d === "Sun" ? "sun" : d === "Sat" ? "sat" : ""}`}>
                        {d}
                    </div>
                ))}
            </div>

            <div className="cells">
                {cells.map((day, i) => {
                    const key = day ? formatKey(year, month, day) : `empty-${i}`;
                    const hasEvents = day ? !!events[key] : false;
                    return (
                        <CalendarCell
                            key={key}
                            day={day}
                            hasEvents={hasEvents}
                            onClick={() => onDayClick(day)}
                            weekDay={(i + (new Date(year, month, 1).getDay())) % 7}
                        />
                    );
                })}
            </div>
        </div>
    );
}
