import { useEffect, useState } from "react";
import { formatDateKey, loadEvents, saveEvents } from "../utils";

export function useCalendar() {
    const [displayedDate, setDisplayedDate] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const [incomingDate, setIncomingDate] = useState(null);
    const [animationDirection, setAnimationDirection] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState(null);
    const [events, setEvents] = useState(() => loadEvents());

    useEffect(() => {
        saveEvents(events);
    }, [events]);

    const changeMonthAnimated = (newDate, direction) => {
        setIncomingDate(newDate);
        setAnimationDirection(direction);
        setIsAnimating(true);
        setTimeout(() => {
            setDisplayedDate(newDate);
            setIncomingDate(null);
            setAnimationDirection(null);
            setIsAnimating(false);
        }, 300);
    };

    const goToPreviousMonth = () => {
        const year = displayedDate.getFullYear();
        const month = displayedDate.getMonth();
        changeMonthAnimated(new Date(year, month - 1, 1), "right");
    };

    const goToNextMonth = () => {
        const year = displayedDate.getFullYear();
        const month = displayedDate.getMonth();
        changeMonthAnimated(new Date(year, month + 1, 1), "left");
    };

    const goToSpecificMonth = (monthIndex) => {
        const year = displayedDate.getFullYear();
        changeMonthAnimated(
            new Date(year, monthIndex, 1),
            monthIndex < displayedDate.getMonth() ? "right" : "left"
        );
    };

    const goToToday = () => {
        const now = new Date();
        changeMonthAnimated(new Date(now.getFullYear(), now.getMonth(), 1), "left");
    };

    const openModalForDay = (dayNumber) => {
        if (!dayNumber) return;
        const year = displayedDate.getFullYear();
        const month = displayedDate.getMonth();
        setModalDate(new Date(year, month, dayNumber));
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalDate(null);
    };

    const addEvent = (date, text) => {
        const key = formatDateKey(date);
        setEvents((prev) => {
            const list = prev[key] ? [...prev[key]] : [];
            list.push({ id: Date.now(), text, createdAt: new Date().toISOString() });
            return { ...prev, [key]: list };
        });
    };

    const deleteEvent = (date, id) => {
        const key = formatDateKey(date);
        setEvents((prev) => {
            const list = (prev[key] || []).filter((eventItem) => eventItem.id !== id);
            const updated = { ...prev };
            if (list.length) updated[key] = list;
            else delete updated[key];
            return updated;
        });
    };

    return {
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
    };
}
