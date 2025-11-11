// src/components/Calendar/index.jsx
import React from "react";
import CalendarHeader from "../CalendarHeader";
import CalendarGrid from "../CalendarGrid";
import DayModal from "../DayModal";
import "./styles.css";
import { useSelector } from "react-redux";
import { formatDateKey } from "./utils";

export default function Calendar() {
    const calendarState = useSelector((s) => s.calendar);
    const displayedDate = new Date(calendarState.displayedDateIso);

    return (
        <div className="calendar-root">
            <CalendarHeader />

            <div className="calendar-viewport">
                <CalendarGrid />
            </div>

            {calendarState.modalOpen && calendarState.modalDateIso && (
                <DayModal
                    // DayModal will read modalDate and events directly from store,
                    // but pass format util for getting events key if needed.
                    formatKey={formatDateKey}
                />
            )}
        </div>
    );
}
