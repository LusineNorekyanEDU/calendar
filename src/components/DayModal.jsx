import React, { useState } from "react";

function niceDate(d) {
    return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
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
                    <button className="close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="existing-events">
                        <h4>Events</h4>
                        {events.length === 0 && <div className="no-events">No events for this day</div>}
                        <ul>
                            {events.map((ev) => (
                                <li key={ev.id} className="event-item">
                                    <span>{ev.text}</span>
                                    <button className="delete-event" onClick={() => onDelete(ev.id)}>Delete</button>
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
                            <button onClick={onClose} className="cancel-btn">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
