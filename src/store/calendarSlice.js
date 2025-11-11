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
            const d = new Date(dateIso);
            const key = formatDateKey(d);
            const list = state.events[key] ? [...state.events[key]] : [];
            list.push({ id: Date.now(), text, createdAt: new Date().toISOString() });
            state.events = { ...state.events, [key]: list };
        },

        deleteEventFromState(state, action) {
            // payload: { dateIso, id }
            const { dateIso, id } = action.payload;
            const d = new Date(dateIso);
            const key = formatDateKey(d);
            const list = (state.events[key] || []).filter((ev) => ev.id !== id);
            const copy = { ...state.events };
            if (list.length) copy[key] = list;
            else delete copy[key];
            state.events = copy;
        },

        // direct setter (used by finalize)
        setDisplayedDateIso(state, action) {
            state.displayedDateIso = action.payload;
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
    const dateIso = new Date(year, month, dayNumber).toISOString();
    dispatch(openModalForIso(dateIso));
};

export const addEvent = (dateIso, text) => (dispatch) => {
    dispatch(addEventToState({ dateIso, text }));
};

export const deleteEvent = (dateIso, id) => (dispatch) => {
    dispatch(deleteEventFromState({ dateIso, id }));
};

export default calendarSlice.reducer;
