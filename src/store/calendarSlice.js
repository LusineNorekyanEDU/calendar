// src/store/calendarSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
    formatDateKey,
    loadEvents,
    saveEvents
} from "../components/Calendar/utils";

const API_URL = "http://localhost:5000/events";
const CATEGORIES_URL = "http://localhost:5000/categories";

export const fetchEventsFromServer = () => async (dispatch) => {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Support various shapes:
        // 1) { id, data: [events...], categories: [...] }   (old data shape)
        // 2) { id, events: [...], categories: [...] }      (new shape from server)
        // 3) [...events] or { data: [...] } etc.
        let eventsArray = [];
        let categoriesArray = [];

        if (Array.isArray(data)) {
            eventsArray = data;
        } else if (data && Array.isArray(data.data)) {
            eventsArray = data.data;
            categoriesArray = data.categories || [];
        } else if (data && Array.isArray(data.events)) {
            eventsArray = data.events;
            categoriesArray = data.categories || [];
        } else if (data && Array.isArray(data.data?.events)) {
            eventsArray = data.data.events;
            categoriesArray = data.data.categories || [];
        } else {
            // Fallback: try to pick any array fields
            if (Array.isArray(data.data)) eventsArray = data.data;
            else if (Array.isArray(data.events)) eventsArray = data.events;
            else if (Array.isArray(data)) eventsArray = data;
            categoriesArray = data.categories || [];
        }

        dispatch(setEventsFromServer(eventsArray));
        if (categoriesArray.length) dispatch(setCategoriesFromServer(categoriesArray));
    } catch (err) {
        console.error("Failed to fetch events:", err);
    }
};

export const addEventToServer = (text, dateIso, categoryId = null) => async (dispatch) => {
    try {
        const normalizedDate =
            dateIso.length > 10 ? dateIso.split("T")[0] : dateIso;

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, date: normalizedDate, categoryId }),
        });

        const data = await res.json();

        if (res.ok) {
            // Uses the real server event
            dispatch(addEventFromServer(data.event));
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
        if (res.ok) dispatch(deleteEventFromState({ dateIso, id }));
    } catch (err) {
        console.error("Failed to delete event:", err);
    }
};


export const updateEventOnServer = (id, updates) => async (dispatch) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });

        const data = await res.json();

        if (res.ok) {
            dispatch(updateEventInState(data.event));
        } else {
            console.error(data.error);
        }
    } catch (err) {
        console.error("Failed to update event:", err);
    }
};

// Categories server calls
export const fetchCategoriesFromServer = () => async (dispatch) => {
    try {
        const res = await fetch(CATEGORIES_URL);
        const data = await res.json();
        // expecting { categories: [...] } or [...categories]
        const cats = Array.isArray(data) ? data : data.categories || [];
        dispatch(setCategoriesFromServer(cats));
    } catch (err) {
        console.error("Failed to fetch categories:", err);
    }
};

export const createCategoryToServer = (name, color) => async (dispatch) => {
    try {
        const res = await fetch(CATEGORIES_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, color }),
        });
        const data = await res.json();
        if (res.ok) {
            dispatch(addCategoryFromServer(data.category));
        } else {
            console.error(data.error);
        }
    } catch (err) {
        console.error("Failed to create category:", err);
    }
};

export const updateCategoryOnServer = (id, updates) => async (dispatch) => {
    try {
        const res = await fetch(`${CATEGORIES_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (res.ok) {
            dispatch(updateCategoryInState(data.category));
        } else {
            console.error(data.error);
        }
    } catch (err) {
        console.error("Failed to update category:", err);
    }
};

export const deleteCategoryFromServer = (id) => async (dispatch) => {
    try {
        const res = await fetch(`${CATEGORIES_URL}/${id}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (res.ok) {
            dispatch(deleteCategoryFromState(id));
        } else {
            console.error(data.error);
        }
    } catch (err) {
        console.error("Failed to delete category:", err);
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
    events: loadEvents(),
    categories: [], // <-- new
};

const calendarSlice = createSlice({
    name: "calendar",
    initialState,
    reducers: {

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


        openModalForIso(state, action) {
            state.modalDateIso = action.payload;
            state.modalOpen = true;
        },
        closeModal(state) {
            state.modalOpen = false;
            state.modalDateIso = null;
        },

        // categories reducers
        setCategoriesFromServer(state, action) {
            state.categories = action.payload || [];
        },
        addCategoryFromServer(state, action) {
            state.categories = [...state.categories, action.payload];
        },
        updateCategoryInState(state, action) {
            const cat = action.payload;
            state.categories = state.categories.map((c) => (c.id === cat.id ? cat : c));
        },
        deleteCategoryFromState(state, action) {
            const id = action.payload;
            state.categories = state.categories.filter((c) => c.id !== id);

            // remove reference from events in local state
            for (const key of Object.keys(state.events)) {
                state.events[key] = state.events[key].map((ev) =>
                    ev.categoryId === id ? { ...ev, categoryId: null } : ev
                );
            }
            saveEvents(state.events);
        },

        // Used when fetching from server
        setEventsFromServer(state, action) {
            const newEventsMap = {};

            for (const ev of action.payload) {
                const key = formatDateKey(ev.date);
                if (!newEventsMap[key]) newEventsMap[key] = [];
                newEventsMap[key].push(ev);
            }

            state.events = newEventsMap;
            saveEvents(state.events);
        },

        // Used when POST creates a new event on server
        addEventFromServer(state, action) {
            const ev = action.payload;
            const key = formatDateKey(ev.date);

            const list = state.events[key] ? [...state.events[key]] : [];
            list.push(ev);

            state.events = { ...state.events, [key]: list };
            saveEvents(state.events);
        },

        deleteEventFromState(state, action) {
            const { dateIso, id } = action.payload;

            const key =
                dateIso.length === 10 ? dateIso : formatDateKey(dateIso);

            const list = (state.events[key] || []).filter((e) => e.id !== id);

            const newMap = { ...state.events };
            if (list.length) newMap[key] = list;
            else delete newMap[key];

            state.events = newMap;
            saveEvents(state.events);
        },

        /*
           NEW: UPDATE EVENT LOCALLY
           Moves between dates if needed.
            */
        updateEventInState(state, action) {
            const ev = action.payload;

            // Find current date key
            const oldKey = Object.keys(state.events).find((d) =>
                state.events[d].some((x) => x.id === ev.id)
            );

            const newKey = formatDateKey(ev.date);

            // Remove from old
            if (oldKey) {
                state.events[oldKey] = state.events[oldKey].filter(
                    (x) => x.id !== ev.id
                );
                if (state.events[oldKey].length === 0) {
                    delete state.events[oldKey];
                }
            }

            // Add to new date
            if (!state.events[newKey]) state.events[newKey] = [];
            state.events[newKey].push(ev);

            saveEvents(state.events);
        },

        // internal
        setDisplayedDateIso(state, action) {
            state.displayedDateIso = action.payload;
        },
    },
});

/*
   ACTION EXPORTS
   */

export const {
    setIncomingDateIso,
    setAnimationDirection,
    setIsAnimating,
    finalizeDisplayedDateIso,
    openModalForIso,
    closeModal,
    setEventsFromServer,
    addEventFromServer,
    deleteEventFromState,
    updateEventInState,
    setDisplayedDateIso,
    // categories
    setCategoriesFromServer,
    addCategoryFromServer,
    updateCategoryInState,
    deleteCategoryFromState,
} = calendarSlice.actions;

/*
   SELECTORS
    */

export const selectCalendarState = (state) => state.calendar;

export const selectDisplayedDateIso = (state) =>
    state.calendar.displayedDateIso;

export const selectIncomingDateIso = (state) =>
    state.calendar.incomingDateIso;

export const selectModalOpen = (state) => state.calendar.modalOpen;

export const selectModalDateIso = (state) => state.calendar.modalDateIso;

export const selectEvents = (state) => state.calendar.events;

export const selectCategories = (state) => state.calendar.categories;

export const selectAnimationDirection = (state) =>
    state.calendar.animationDirection;

export const selectIsAnimating = (state) => state.calendar.isAnimating;

/*
   COMPLEX THUNKS — Animation & Modal Helpers
    */

export const changeMonthAnimated =
    (newDate, direction) => (dispatch) => {
        const newIso = new Date(
            newDate.getFullYear(),
            newDate.getMonth(),
            1
        ).toISOString();

        dispatch(setIncomingDateIso(newIso));
        dispatch(setAnimationDirection(direction));
        dispatch(setIsAnimating(true));

        setTimeout(() => {
            dispatch(finalizeDisplayedDateIso(newIso));
        }, 300);
    };

export const goToPreviousMonth = () => (dispatch, getState) => {
    const displayed = new Date(getState().calendar.displayedDateIso);
    dispatch(
        changeMonthAnimated(
            new Date(displayed.getFullYear(), displayed.getMonth() - 1, 1),
            "right"
        )
    );
};

export const goToNextMonth = () => (dispatch, getState) => {
    const displayed = new Date(getState().calendar.displayedDateIso);
    dispatch(
        changeMonthAnimated(
            new Date(displayed.getFullYear(), displayed.getMonth() + 1, 1),
            "left"
        )
    );
};

export const goToSpecificMonth = (monthIndex) => (dispatch, getState) => {
    const displayed = new Date(getState().calendar.displayedDateIso);
    dispatch(
        changeMonthAnimated(
            new Date(displayed.getFullYear(), monthIndex, 1),
            monthIndex < displayed.getMonth() ? "right" : "left"
        )
    );
};

export const goToToday = () => (dispatch) => {
    const now = new Date();
    dispatch(
        changeMonthAnimated(
            new Date(now.getFullYear(), now.getMonth(), 1),
            "left"
        )
    );
};

export const openModalForDay = (dayNumber) => (dispatch, getState) => {
    if (!dayNumber) return;
    const displayed = new Date(getState().calendar.displayedDateIso);

    const y = displayed.getFullYear();
    const m = displayed.getMonth() + 1;

    const localDate = `${y}-${String(m).padStart(2, "0")}-${String(
        dayNumber
    ).padStart(2, "0")}`;

    dispatch(openModalForIso(localDate));
};

export default calendarSlice.reducer;
