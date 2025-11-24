// src/components/DayModal/index.jsx
import React, { useEffect, useState } from "react";
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
    selectModalOpen,
    fetchCategoriesFromServer,
    createCategoryToServer,
    selectCategories
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
    const categories = useSelector(selectCategories) || [];

    const [text, setText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);

    // create-category local state
    const [newCatName, setNewCatName] = useState("");
    const [newCatColor, setNewCatColor] = useState("#6c8cff");

    // editing existing event
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        dispatch(fetchCategoriesFromServer());
    }, [dispatch]);

    useEffect(() => {
        setText("");
        setSelectedCategory(null);
        setEditingId(null);
        setEditingText("");
        setEditingCategory(null);
    }, [modalDateIso, modalOpen]);

    const modalDate = modalDateIso ? new Date(modalDateIso) : null;
    const eventsForDay = modalDate ? eventsMap[formatDateKey(modalDate)] || [] : [];

    const handleAdd = () => {
        const trimmed = text.trim();
        if (!trimmed || !modalDateIso) return;

        dispatch(addEventToServer(trimmed, modalDateIso, selectedCategory || null));
        setText("");
        setSelectedCategory(null);
    };

    const handleDelete = (id) => {
        if (!modalDateIso) return;
        dispatch(deleteEventFromServer(modalDateIso, id));
    };

    const startEdit = (eventItem) => {
        setEditingId(eventItem.id);
        setEditingText(eventItem.text || "");
        setEditingCategory(eventItem.categoryId || null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingText("");
        setEditingCategory(null);
    };

    const saveEdit = (eventItem) => {
        const trimmed = editingText.trim();
        if (!trimmed) return;

        dispatch(updateEventOnServer(eventItem.id, {
            text: trimmed,
            date: modalDateIso,
            categoryId: editingCategory || null
        }));

        cancelEdit();
    };

    const handleCreateCategory = () => {
        const n = newCatName.trim();
        if (!n || !newCatColor) return;

        dispatch(createCategoryToServer(n, newCatColor));
        setNewCatName("");
        setNewCatColor("#6c8cff");
    };

    if (!modalOpen || !modalDate) return null;

    return (
        <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{niceDate(modalDate)}</h3>
                    <button className="close" onClick={() => dispatch(closeModal())}>✕</button>
                </div>

                <div className="modal-body">

                    {/* Existing events */}
                    <div className="existing-events">
                        <h4>Events</h4>
                        {eventsForDay.length === 0 && <div className="no-events">No events for this day</div>}

                        <ul>
                            {eventsForDay.map((eventItem) => {
                                const cat = eventItem.categoryId
                                    ? categories.find((c) => c.id === eventItem.categoryId)
                                    : null;

                                return (
                                    <li key={eventItem.id} className="event-item">
                                        {editingId === eventItem.id ? (
                                            <>
                                                <input
                                                    value={editingText}
                                                    onChange={(e) => setEditingText(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(eventItem); }}
                                                />

                                                <select
                                                    value={editingCategory || ""}
                                                    onChange={(e) => setEditingCategory(e.target.value || null)}
                                                >
                                                    <option value="">No category</option>
                                                    {categories.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>

                                                <button className="save-event" onClick={() => saveEdit(eventItem)}>Save</button>
                                                <button className="cancel-event" onClick={cancelEdit}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                        <span className="event-with-cat">
                          {cat ? (
                              <span
                                  className="cat-pill"
                                  title={cat.name}
                                  style={{
                                      backgroundColor: cat.color,
                                      width: 10,
                                      height: 10,
                                      borderRadius: 3,
                                      marginRight: 8,
                                      display: "inline-block"
                                  }}
                              />
                          ) : (
                              <span
                                  className="cat-pill-empty"
                                  title="No category"
                                  style={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: 3,
                                      marginRight: 8,
                                      display: "inline-block",
                                      border: "1px solid #ccc"
                                  }}
                              />
                          )}
                            {eventItem.text}
                        </span>

                                                <button className="edit-event" onClick={() => startEdit(eventItem)}>Edit</button>
                                                <button className="delete-event" onClick={() => handleDelete(eventItem.id)}>Delete</button>
                                            </>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Add event */}
                    <div className="add-event">
                        <h4>Add event</h4>
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write a short note..."
                            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                        />

                        <label style={{ marginTop: 8 }}>Category</label>
                        <select
                            value={selectedCategory || ""}
                            onChange={(e) => setSelectedCategory(e.target.value || null)}
                        >
                            <option value="">No category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        {/* Create New Category */}
                        <div className="create-category-box">
                            <h5>Create new category</h5>

                            <input
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                placeholder="Category name"
                            />

                            <input
                                type="color"
                                value={newCatColor}
                                onChange={(e) => setNewCatColor(e.target.value)}
                            />

                            <button
                                onClick={handleCreateCategory}
                                disabled={!newCatName.trim() || !newCatColor}
                                className="create-cat-btn"
                            >
                                Create Category
                            </button>
                        </div>

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
