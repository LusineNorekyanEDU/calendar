import React, { useEffect, useState } from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import DayModal from "./DayModal";

/**
 * Helper: format date key for storage: "YYYY-MM-DD"
 */
function formatKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * load events map from localStorage
 * shape: { "YYYY-MM-DD": [ {id, text, createdAt} , ... ], ... }
 */
function loadEvents() {
    try {
        const raw = localStorage.getItem("calendar-events");
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveEvents(map) {
    localStorage.setItem("calendar-events", JSON.stringify(map));
}

export default function Calendar() {
    // displayedDate is what is currently shown in the grid
    const [displayedDate, setDisplayedDate] = useState(() => {
        const now = new Date();
        // show first day of month for easier arithmetic / comparisons
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    // incomingDate is used for slide animation (when user navigates)
    const [incomingDate, setIncomingDate] = useState(null);
    const [animDirection, setAnimDirection] = useState(null); // "left" or "right"
    const [isAnimating, setIsAnimating] = useState(false);

    // modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState(null);

    // events map
    const [events, setEvents] = useState(() => loadEvents());

    // persist events whenever changed
    useEffect(() => {
        saveEvents(events);
    }, [events]);

    // navigation -> animate then switch displayedDate
    const changeMonthAnimated = (newDate, direction) => {
        // set incoming and trigger animation
        setIncomingDate(newDate);
        setAnimDirection(direction);
        setIsAnimating(true);

        // After animation duration, swap displayedDate and clear animation
        const totalMs = 300; // should match CSS animation duration
        setTimeout(() => {
            setDisplayedDate(newDate);
            setIncomingDate(null);
            setAnimDirection(null);
            setIsAnimating(false);
        }, totalMs);
    };

    const goToPreviousMonth = () => {
        const y = displayedDate.getFullYear();
        const m = displayedDate.getMonth();
        changeMonthAnimated(new Date(y, m - 1, 1), "right");
    };

    const goToNextMonth = () => {
        const y = displayedDate.getFullYear();
        const m = displayedDate.getMonth();
        changeMonthAnimated(new Date(y, m + 1, 1), "left");
    };

    const goToSpecificMonth = (monthIndex) => {
        // keep year unchanged for select; if you want to allow year selection extend similarly
        const y = displayedDate.getFullYear();
        changeMonthAnimated(new Date(y, monthIndex, 1), monthIndex < displayedDate.getMonth() ? "right" : "left");
    };

    // open modal for a day (day is number or null)
    const openModalForDay = (dayNumber) => {
        if (!dayNumber) return;
        const y = displayedDate.getFullYear();
        const m = displayedDate.getMonth();
        const d = dayNumber;
        setModalDate(new Date(y, m, d));
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalDate(null);
    };

    // event CRUD helpers
    const addEvent = (dateObj, text) => {
        const key = formatKey(dateObj);
        setEvents((prev) => {
            const list = prev[key] ? [...prev[key]] : [];
            list.push({ id: Date.now(), text, createdAt: new Date().toISOString() });
            const copy = { ...prev, [key]: list };
            return copy;
        });
    };

    const deleteEvent = (dateObj, id) => {
        const key = formatKey(dateObj);
        setEvents((prev) => {
            const list = (prev[key] || []).filter((e) => e.id !== id);
            const copy = { ...prev };
            if (list.length) copy[key] = list;
            else delete copy[key];
            return copy;
        });
    };

    // jump-to-today helper
    const goToToday = () => {
        const now = new Date();
        changeMonthAnimated(new Date(now.getFullYear(), now.getMonth(), 1), "left");
    };

    return (
        <div className="calendar-root">
            <CalendarHeader
                month={displayedDate.getMonth()}
                year={displayedDate.getFullYear()}
                onPrev={goToPreviousMonth}
                onNext={goToNextMonth}
                onSelectMonth={goToSpecificMonth}
                onToday={goToToday}
            />

            <div className="calendar-viewport">
                {/* currently displayed grid */}
                <div
                    className={`calendar-panel ${
                        isAnimating ? `animating ${animDirection === "left" ? "slide-left" : "slide-right"}` : ""
                    }`}
                    key={`displayed-${displayedDate.getMonth()}-${displayedDate.getFullYear()}`}
                >
                    <CalendarGrid
                        month={displayedDate.getMonth()}
                        year={displayedDate.getFullYear()}
                        onDayClick={openModalForDay}
                        events={events}
                    />
                </div>

                {/* incoming grid during animation (overlayed) */}
                {incomingDate && (
                    <div
                        className={`calendar-panel incoming ${animDirection === "left" ? "incoming-left" : "incoming-right"}`}
                        key={`incoming-${incomingDate.getMonth()}-${incomingDate.getFullYear()}`}
                    >
                        <CalendarGrid
                            month={incomingDate.getMonth()}
                            year={incomingDate.getFullYear()}
                            onDayClick={openModalForDay}
                            events={events}
                        />
                    </div>
                )}
            </div>

            {modalOpen && modalDate && (
                <DayModal
                    date={modalDate}
                    events={(events && events[formatKey(modalDate)]) || []}
                    onClose={closeModal}
                    onAdd={(text) => addEvent(modalDate, text)}
                    onDelete={(id) => deleteEvent(modalDate, id)}
                />
            )}
        </div>
    );
}
