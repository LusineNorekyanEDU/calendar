import React, { useState } from "react";
import "./styles.css";

/**
 * DayModal:
 * Props:
 *  - date (Date)
 *  - events (array)
 *  - onClose()
 *  - onAdd(text)
 *  - onDelete(id)
 *
 * Note: This component intentionally keeps the same behavior as original:
 * - clicking overlay closes modal
 * - clicking inside modal stops propagation
 * - add and delete handlers call callbacks passed from parent
 */

function niceDate(date) {
    return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

export default function DayModal({ date, events = [], onClose, onAdd, onDelete }) {
    const [text, setText] = useState("");

    const handleAdd = () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setText("");
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{niceDate(date)}</h3>
                    <button className="close" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <div className="existing-events">
                        <h4>Events</h4>
                        {events.length === 0 && <div className="no-events">No events for this day</div>}
                        <ul>
                            {events.map((eventItem) => (
                                <li key={eventItem.id} className="event-item">
                                    <span>{eventItem.text}</span>
                                    <button
                                        className="delete-event"
                                        onClick={() => onDelete(eventItem.id)}
                                        aria-label={`Delete event ${eventItem.id}`}
                                    >
                                        Delete
                                    </button>
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
                            <button onClick={handleAdd} className="add-btn">
                                Add
                            </button>
                            <button onClick={onClose} className="cancel-btn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
