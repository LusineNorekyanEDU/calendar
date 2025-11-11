// src/components/CalendarGrid/index.jsx
import React from "react";
import CalendarCell from "../CalendarCell";
import { formatDateKeyFromParts } from "./utils";
import "./styles.css";
import { useSelector, useDispatch } from "react-redux";
import { openModalForDay } from "../../store/calendarSlice";

function padArray(count) {
    return new Array(count).fill(null);
}

function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

export default function CalendarGrid() {
    const dispatch = useDispatch();
    const calendarState = useSelector((s) => s.calendar);
    const displayed = new Date(calendarState.displayedDateIso);
    const month = displayed.getMonth();
    const year = displayed.getFullYear();
    const events = calendarState.events || {};

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = daysInMonth(year, month);

    const cells = [...padArray(firstDayIndex), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

    return (
        <div className="calendar-grid">
            <div className="dow-row">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dow) => (
                    <div key={dow} className={`dow-cell ${dow === "Sun" ? "sun" : dow === "Sat" ? "sat" : ""}`}>
                        {dow}
                    </div>
                ))}
            </div>

            <div className="cells">
                {cells.map((day, i) => {
                    const key = day ? formatDateKeyFromParts(year, month, day) : `empty-${i}`;
                    const hasEvents = day ? !!events[key] : false;
                    const weekDay = (i + firstDayIndex) % 7;

                    return (
                        <CalendarCell
                            key={key}
                            day={day}
                            hasEvents={hasEvents}
                            onClick={() => dispatch(openModalForDay(day))}
                            weekDay={weekDay}
                        />
                    );
                })}
            </div>
        </div>
    );
}
