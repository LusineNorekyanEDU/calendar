// src/store/calendarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { formatDateKey, loadEvents, saveEvents } from "../components/Calendar/utils";

/**
 * State shape:
 * {
 *   displayedDateIso: "YYYY-MM-DDT00:00:00.000Z"  // first day of displayed month
 *   incomingDateIso: null | ISO,
 *   animationDirection: null | "left"|"right",
 *   isAnimating: boolean,
 *   modalOpen: boolean,
 *   modalDateIso: null | ISO,
 *   events: { "YYYY-MM-DD": [ {id, text, createdAt}, ... ], ... }
 * }
 */
const API_URL = "http://localhost:5000/events";

// --- Thunks for backend sync ---
export const fetchEventsFromServer = () => async (dispatch) => {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        dispatch(setEventsFromServer(data.data));
    } catch (err) {
        console.error("Failed to fetch events:", err);
    }
};

export const addEventToServer = (text, dateIso) => async (dispatch) => {
    try {
        const normalizedDate = dateIso.length > 10 ? dateIso.split("T")[0] : dateIso;
        const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, date: normalizedDate })
    });
        const data = await res.json();
        if (res.ok) {
            dispatch(addEventToState({ dateIso: normalizedDate, text }));
        } else {
            console.error(data.error);
        }
    } catch (err) {
        console.error("Failed to add event:", err);
    }
};


export const deleteEventFromServer = (dateIso, id) => async (dispatch) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (res.ok) {
            dispatch(deleteEventFromState({ dateIso, id }));
        }
    } catch (err) {
        console.error("Failed to delete event:", err);
    }
};

const initialDisplayedDate = (() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    return first.toISOString();
})();

const initialState = {
    displayedDateIso: initialDisplayedDate,
    incomingDateIso: null,
    animationDirection: null,
    isAnimating: false,
    modalOpen: false,
    modalDateIso: null,
    events: loadEvents()
};

const calendarSlice = createSlice({
    name: "calendar",
    initialState,
    reducers: {
        // animation lifecycle
        setIncomingDateIso(state, action) {
            state.incomingDateIso = action.payload;
        },
        setAnimationDirection(state, action) {
            state.animationDirection = action.payload;
        },
        setIsAnimating(state, action) {
            state.isAnimating = action.payload;
        },
        finalizeDisplayedDateIso(state, action) {
            state.displayedDateIso = action.payload;
            state.incomingDateIso = null;
            state.animationDirection = null;
            state.isAnimating = false;
        },

        // modal
        openModalForIso(state, action) {
            state.modalDateIso = action.payload;
            state.modalOpen = true;
        },
        closeModal(state) {
            state.modalOpen = false;
            state.modalDateIso = null;
        },

        // events
        addEventToState(state, action) {
            // payload: { dateIso, text }
            const { dateIso, text } = action.payload;

            // If dateIso is already a "YYYY-MM-DD" date-only string, use it directly as key.
            // Otherwise create a Date and format it.
            let key;
            if (typeof dateIso === "string" && dateIso.length === 10 && dateIso[4] === "-") {
                key = dateIso;
            } else {
                const d = new Date(dateIso);
                key = formatDateKey(d);
            }

            const list = state.events[key] ? [...state.events[key]] : [];
            // Use server-generated id when available? We'll keep Date.now() for client-added local id.
            list.push({ id: Date.now(), text, createdAt: new Date().toISOString() });
            state.events = { ...state.events, [key]: list };

            // persist
            saveEvents(state.events);
        },


        deleteEventFromState(state, action) {
            // payload: { dateIso, id }
            const { dateIso, id } = action.payload;

            let key;
            if (typeof dateIso === "string" && dateIso.length === 10 && dateIso[4] === "-") {
                key = dateIso;
            } else {
                const d = new Date(dateIso);
                key = formatDateKey(d);
            }

            const list = (state.events[key] || []).filter((ev) => ev.id !== id);
            const copy = { ...state.events };
            if (list.length) copy[key] = list;
            else delete copy[key];
            state.events = copy;

            // persist
            saveEvents(state.events);
        },


        // direct setter (used by finalize)
        setDisplayedDateIso(state, action) {
            state.displayedDateIso = action.payload;
        },
        setEventsFromServer(state, action) {
            const newEventsMap = {};
            for (const ev of action.payload) {
                const dateKey = formatDateKey(ev.date); // safe, timezones handled
                if (!newEventsMap[dateKey]) newEventsMap[dateKey] = [];
                newEventsMap[dateKey].push(ev);
            }
            state.events = newEventsMap;
            saveEvents(state.events);
        }



    }
});

export const {
    setIncomingDateIso,
    setAnimationDirection,
    setIsAnimating,
    finalizeDisplayedDateIso,
    openModalForIso,
    closeModal,
    addEventToState,
    deleteEventFromState,
    setEventsFromServer,
    setDisplayedDateIso
} = calendarSlice.actions;


// Thunk helpers (not in slice) — exported functions that dispatch multiple actions and handle timeouts
export const changeMonthAnimated =
    (newDate, direction) =>
        (dispatch) => {
            const newIso = new Date(newDate.getFullYear(), newDate.getMonth(), 1).toISOString();
            dispatch(setIncomingDateIso(newIso));
            dispatch(setAnimationDirection(direction));
            dispatch(setIsAnimating(true));

            const totalMs = 300; // must match CSS animation duration
            setTimeout(() => {
                dispatch(finalizeDisplayedDateIso(newIso));
            }, totalMs);
        };

// convenience thunks
export const goToPreviousMonth = () => (dispatch, getState) => {
    const state = getState().calendar;
    const displayed = new Date(state.displayedDateIso);
    const year = displayed.getFullYear();
    const month = displayed.getMonth();
    dispatch(changeMonthAnimated(new Date(year, month - 1, 1), "right"));
};

export const goToNextMonth = () => (dispatch, getState) => {
    const state = getState().calendar;
    const displayed = new Date(state.displayedDateIso);
    const year = displayed.getFullYear();
    const month = displayed.getMonth();
    dispatch(changeMonthAnimated(new Date(year, month + 1, 1), "left"));
};

export const goToSpecificMonth = (monthIndex) => (dispatch, getState) => {
    const state = getState().calendar;
    const displayed = new Date(state.displayedDateIso);
    const year = displayed.getFullYear();
    dispatch(
        changeMonthAnimated(
            new Date(year, monthIndex, 1),
            monthIndex < displayed.getMonth() ? "right" : "left"
        )
    );
};

export const goToToday = () => (dispatch) => {
    const now = new Date();
    dispatch(changeMonthAnimated(new Date(now.getFullYear(), now.getMonth(), 1), "left"));
};

export const openModalForDay = (dayNumber) => (dispatch, getState) => {
    if (!dayNumber) return;
    const state = getState().calendar;
    const displayed = new Date(state.displayedDateIso);
    const year = displayed.getFullYear();
    const month = displayed.getMonth();
    // ✅ use local date-only string to avoid timezone shift
    const localDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    dispatch(openModalForIso(localDate));
};


export const addEvent = (dateIso, text) => (dispatch) => {
    dispatch(addEventToState({ dateIso, text }));
};

export const deleteEvent = (dateIso, id) => (dispatch) => {
    dispatch(deleteEventFromState({ dateIso, id }));
};

export default calendarSlice.reducer;
