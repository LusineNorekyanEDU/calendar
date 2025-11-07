import React from "react";
import CalendarHeader from "../CalendarHeader";
import CalendarGrid from "../CalendarGrid";
import DayModal from "../DayModal";
import { useCalendar } from "./hooks/useCalendar";
import { formatDateKey } from "./utils";
import "./styles.css";

export default function Calendar() {
    const {
        displayedDate,
        incomingDate,
        animationDirection,
        isAnimating,
        modalOpen,
        modalDate,
        events,
        goToPreviousMonth,
        goToNextMonth,
        goToSpecificMonth,
        goToToday,
        openModalForDay,
        closeModal,
        addEvent,
        deleteEvent
    } = useCalendar();

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
                <div
                    className={`calendar-panel ${
                        isAnimating
                            ? `animating ${
                                animationDirection === "left" ? "slide-left" : "slide-right"
                            }`
                            : ""
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

                {incomingDate && (
                    <div
                        className={`calendar-panel incoming ${
                            animationDirection === "left" ? "incoming-left" : "incoming-right"
                        }`}
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
                    events={events?.[formatDateKey(modalDate)] || []}
                    onClose={closeModal}
                    onAdd={(text) => addEvent(modalDate, text)}
                    onDelete={(id) => deleteEvent(modalDate, id)}
                />
            )}
        </div>
    );
}
