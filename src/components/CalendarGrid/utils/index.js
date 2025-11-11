// src/components/CalendarGrid/utils/index.js
export function formatDateKeyFromParts(year, monthZeroBased, day) {
    const month = String(monthZeroBased + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${month}-${dd}`;
}
