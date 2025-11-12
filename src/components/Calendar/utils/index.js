// src/components/Calendar/utils/index.js
export function formatDateKey(dateOrString) {
    // If input is already "YYYY-MM-DD", return as-is
    if (typeof dateOrString === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateOrString)) {
        return dateOrString;
    }

    // Otherwise it's a Date object (or full ISO)
    const d = new Date(dateOrString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}


export function loadEvents() {
    try {
        const raw = localStorage.getItem("calendar-events");
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function saveEvents(events) {
    localStorage.setItem("calendar-events", JSON.stringify(events));
}
