// src/components/DayModal/index.jsx
import React, { useState } from "react";
import "./styles.css";
import { useSelector, useDispatch } from "react-redux";
//import { addEvent, deleteEvent, closeModal } from "../../store/calendarSlice";
import { formatDateKey } from "../Calendar/utils";
import { addEventToServer, deleteEventFromServer, closeModal } from "../../store/calendarSlice";


function niceDate(date) {
    return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

export default function DayModal() {
    const dispatch = useDispatch();
    const calendarState = useSelector((s) => s.calendar);
    const modalDateIso = calendarState.modalDateIso;
    const modalDate = modalDateIso ? new Date(modalDateIso) : null;
    const eventsMap = calendarState.events || {};
    const [text, setText] = useState("");

    const eventsForDay = modalDate ? eventsMap[formatDateKey(modalDate)] || [] : [];

    const handleAdd = () => {
        const trimmed = text.trim();
        if (!trimmed || !modalDateIso) return;
        dispatch(addEventToServer(trimmed, modalDateIso));

        setText("");
    };

    const handleDelete = (id) => {
        if (!modalDateIso) return;
        dispatch(deleteEventFromServer(modalDateIso, id));
    };


    if (!modalDate) return null;

    return (
        <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{niceDate(modalDate)}</h3>
                    <button className="close" onClick={() => dispatch(closeModal())} aria-label="Close modal">✕</button>
                </div>

                <div className="modal-body">
                    <div className="existing-events">
                        <h4>Events</h4>
                        {eventsForDay.length === 0 && <div className="no-events">No events for this day</div>}
                        <ul>
                            {eventsForDay.map((eventItem) => (
                                <li key={eventItem.id} className="event-item">
                                    <span>{eventItem.text}</span>
                                    <button className="delete-event" onClick={() => handleDelete(eventItem.id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="add-event">
                        <h4>Add event</h4>
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write a short note..."
                        />
                        <div className="modal-actions">
                            <button onClick={handleAdd} className="add-btn">Add</button>
                            <button onClick={() => dispatch(closeModal())} className="cancel-btn">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
