// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import calendarReducer from "./calendarSlice";
import { saveEvents } from "../components/Calendar/utils";

const store = configureStore({
    reducer: {
        calendar: calendarReducer
    }
});

// Persist events to localStorage whenever calendar.events changes
let prevEvents = store.getState().calendar.events;
store.subscribe(() => {
    const current = store.getState().calendar.events;
    if (current !== prevEvents) {
        try {
            saveEvents(current);
        } catch (e) {
            // ignore
        }
        prevEvents = current;
    }
});

export default store;
