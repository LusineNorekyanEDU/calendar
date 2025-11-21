import React, { useState } from "react";
import "./styles.css";
import { useSelector, useDispatch } from "react-redux";
import { formatDateKey } from "../Calendar/utils";
import {
  addEventToServer,
  deleteEventFromServer,
  updateEventOnServer,
  closeModal,
  selectModalDateIso,
  selectEvents,
  selectModalOpen
} from "../../store/calendarSlice";

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
  const modalOpen = useSelector(selectModalOpen);
  const modalDateIso = useSelector(selectModalDateIso);
  const eventsMap = useSelector(selectEvents) || {};
  const [text, setText] = useState("");
  // track which event is being edited and its temp value
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const modalDate = modalDateIso ? new Date(modalDateIso) : null;
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

  const startEdit = (eventItem) => {
    setEditingId(eventItem.id);
    setEditingText(eventItem.text || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = (eventItem) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    // update only text for now; keep the same date (modalDateIso)
    dispatch(updateEventOnServer(eventItem.id, { text: trimmed, date: modalDateIso }));
    setEditingId(null);
    setEditingText("");
  };

  if (!modalOpen || !modalDate) return null;

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
                  {editingId === eventItem.id ? (
                    <>
                      <input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(eventItem); }}
                      />
                      <button onClick={() => saveEdit(eventItem)} className="save-event">Save</button>
                      <button onClick={cancelEdit} className="cancel-event">Cancel</button>
                    </>
                  ) : (
                    <>
                      <span>{eventItem.text}</span>
                      <button className="edit-event" onClick={() => startEdit(eventItem)}>Edit</button>
                      <button className="delete-event" onClick={() => handleDelete(eventItem.id)}>Delete</button>
                    </>
                  )}
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
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
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
