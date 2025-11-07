export function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
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
